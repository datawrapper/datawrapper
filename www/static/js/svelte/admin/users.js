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
	while (parent.firstChild) { target.appendChild(parent.firstChild); }
}

function reinsertBefore(after, target) {
	var parent = after.parentNode;
	while (parent.firstChild !== after) { target.appendChild(parent.firstChild); }
}

function destroyEach(iterations) {
	for (var i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) { iterations[i].d(); }
	}
}

function createFragment() {
	return document.createDocumentFragment();
}

function createElement(name) {
	return document.createElement(name);
}

function createSvgElement(name) {
	return document.createElementNS('http://www.w3.org/2000/svg', name);
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

function toNumber(value) {
	return value === '' ? undefined : +value;
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

function linear(t) {
	return t;
}

function generateRule(
	a,
	b,
	delta,
	duration,
	ease,
	fn
) {
	var keyframes = '{\n';

	for (var p = 0; p <= 1; p += 16.666 / duration) {
		var t = a + delta * ease(p);
		keyframes += p * 100 + '%{' + fn(t) + '}\n';
	}

	return keyframes + '100% {' + fn(b) + '}\n}';
}

// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
	var hash = 5381;
	var i = str.length;

	while (i--) { hash = ((hash << 5) - hash) ^ str.charCodeAt(i); }
	return hash >>> 0;
}

function wrapTransition(component, node, fn, params, intro, outgroup) {
	var obj = fn(node, params);
	var duration = obj.duration || 300;
	var ease = obj.easing || linear;
	var cssText;

	// TODO share <style> tag between all transitions?
	if (obj.css && !transitionManager.stylesheet) {
		var style = createElement('style');
		document.head.appendChild(style);
		transitionManager.stylesheet = style.sheet;
	}

	if (intro) {
		if (obj.css && obj.delay) {
			cssText = node.style.cssText;
			node.style.cssText += obj.css(0);
		}

		if (obj.tick) { obj.tick(0); }
	}

	return {
		t: intro ? 0 : 1,
		running: false,
		program: null,
		pending: null,
		run: function(intro, callback) {
			var program = {
				start: window.performance.now() + (obj.delay || 0),
				intro: intro,
				callback: callback
			};

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
		start: function(program) {
			component.fire(program.intro ? 'intro.start' : 'outro.start', { node: node });

			program.a = this.t;
			program.b = program.intro ? 1 : 0;
			program.delta = program.b - program.a;
			program.duration = duration * Math.abs(program.b - program.a);
			program.end = program.start + program.duration;

			if (obj.css) {
				if (obj.delay) { node.style.cssText = cssText; }

				program.rule = generateRule(
					program.a,
					program.b,
					program.delta,
					program.duration,
					ease,
					obj.css
				);

				transitionManager.addRule(program.rule, program.name = '__svelte_' + hash(program.rule));

				node.style.animation = (node.style.animation || '')
					.split(', ')
					.filter(function(anim) {
						// when introing, discard old animations if there are any
						return anim && (program.delta < 0 || !/__svelte/.test(anim));
					})
					.concat(program.name + ' ' + program.duration + 'ms linear 1 forwards')
					.join(', ');
			}

			this.program = program;
			this.pending = null;
		},
		update: function(now) {
			var program = this.program;
			if (!program) { return; }

			var p = now - program.start;
			this.t = program.a + program.delta * ease(p / program.duration);
			if (obj.tick) { obj.tick(this.t); }
		},
		done: function() {
			var program = this.program;
			this.t = program.b;
			if (obj.tick) { obj.tick(this.t); }
			if (obj.css) { transitionManager.deleteRule(node, program.name); }
			program.callback();
			program = null;
			this.running = !!this.pending;
		},
		abort: function() {
			if (obj.tick) { obj.tick(1); }
			if (obj.css) { transitionManager.deleteRule(node, this.program.name); }
			this.program = this.pending = null;
			this.running = false;
		}
	};
}

var transitionManager = {
	running: false,
	transitions: [],
	bound: null,
	stylesheet: null,
	activeRules: {},

	add: function(transition) {
		this.transitions.push(transition);

		if (!this.running) {
			this.running = true;
			requestAnimationFrame(this.bound || (this.bound = this.next.bind(this)));
		}
	},

	addRule: function(rule, name) {
		if (!this.activeRules[name]) {
			this.activeRules[name] = true;
			this.stylesheet.insertRule('@keyframes ' + name + ' ' + rule, this.stylesheet.cssRules.length);
		}
	},

	next: function() {
		var this$1 = this;

		this.running = false;

		var now = window.performance.now();
		var i = this.transitions.length;

		while (i--) {
			var transition = this$1.transitions[i];

			if (transition.program && now >= transition.program.end) {
				transition.done();
			}

			if (transition.pending && now >= transition.pending.start) {
				transition.start(transition.pending);
			}

			if (transition.running) {
				transition.update(now);
				this$1.running = true;
			} else if (!transition.pending) {
				this$1.transitions.splice(i, 1);
			}
		}

		if (this.running) {
			requestAnimationFrame(this.bound);
		} else if (this.stylesheet) {
			var i = this.stylesheet.cssRules.length;
			while (i--) { this$1.stylesheet.deleteRule(i); }
			this.activeRules = {};
		}
	},

	deleteRule: function(node, name) {
		node.style.animation = node.style.animation
			.split(', ')
			.filter(function(anim) {
				return anim.indexOf(name) === -1;
			})
			.join(', ');
	}
};

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

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

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

/* @DEPRECATED: plase use @datawrapper/shared instead */

/* globals dw */

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
function patchJSON(url, body, callback) {
    return fetchJSON(url, 'PATCH', 'include', body, callback);
}

var moment = createCommonjsModule(function (module, exports) {
(function (global, factory) {
    module.exports = factory();
}(commonjsGlobal, (function () {
    var hookCallback;

    function hooks () {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback (callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
    }

    function isObject(input) {
        // IE8 will treat undefined and null as object if it wasn't for
        // input != null
        return input != null && Object.prototype.toString.call(input) === '[object Object]';
    }

    function isObjectEmpty(obj) {
        if (Object.getOwnPropertyNames) {
            return (Object.getOwnPropertyNames(obj).length === 0);
        } else {
            var k;
            for (k in obj) {
                if (obj.hasOwnProperty(k)) {
                    return false;
                }
            }
            return true;
        }
    }

    function isUndefined(input) {
        return input === void 0;
    }

    function isNumber(input) {
        return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function createUTC (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty           : false,
            unusedTokens    : [],
            unusedInput     : [],
            overflow        : -2,
            charsLeftOver   : 0,
            nullInput       : false,
            invalidMonth    : null,
            invalidFormat   : false,
            userInvalidated : false,
            iso             : false,
            parsedDateParts : [],
            meridiem        : null,
            rfc2822         : false,
            weekdayMismatch : false
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function (fun) {
            var this$1 = this;

            var t = Object(this);
            var len = t.length >>> 0;

            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(this$1, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    function isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            var parsedParts = some.call(flags.parsedDateParts, function (i) {
                return i != null;
            });
            var isNowValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.weekdayMismatch &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated &&
                (!flags.meridiem || (flags.meridiem && parsedParts));

            if (m._strict) {
                isNowValid = isNowValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }

            if (Object.isFrozen == null || !Object.isFrozen(m)) {
                m._isValid = isNowValid;
            }
            else {
                return isNowValid;
            }
        }
        return m._isValid;
    }

    function createInvalid (flags) {
        var m = createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    var momentProperties = hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i = 0; i < momentProperties.length; i++) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        if (!this.isValid()) {
            this._d = new Date(NaN);
        }
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment (obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor (number) {
        if (number < 0) {
            // -0 -> 0
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function warn(msg) {
        if (hooks.suppressDeprecationWarnings === false &&
                (typeof console !==  'undefined') && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            var arguments$1 = arguments;

            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                var args = [];
                var arg;
                for (var i = 0; i < arguments.length; i++) {
                    arg = '';
                    if (typeof arguments$1[i] === 'object') {
                        arg += '\n[' + i + '] ';
                        for (var key in arguments[0]) {
                            arg += key + ': ' + arguments$1[0][key] + ', ';
                        }
                        arg = arg.slice(0, -2); // Remove trailing comma and space
                    } else {
                        arg = arguments$1[i];
                    }
                    args.push(arg);
                }
                warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (hooks.deprecationHandler != null) {
            hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;

    function isFunction(input) {
        return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
    }

    function set (config) {
        var this$1 = this;

        var prop, i;
        for (i in config) {
            prop = config[i];
            if (isFunction(prop)) {
                this$1[i] = prop;
            } else {
                this$1['_' + i] = prop;
            }
        }
        this._config = config;
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
        // TODO: Remove "ordinalParse" fallback in next major release.
        this._dayOfMonthOrdinalParseLenient = new RegExp(
            (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
                '|' + (/\d{1,2}/).source);
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig), prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        for (prop in parentConfig) {
            if (hasOwnProp(parentConfig, prop) &&
                    !hasOwnProp(childConfig, prop) &&
                    isObject(parentConfig[prop])) {
                // make sure changes to properties don't modify parent config
                res[prop] = extend({}, res[prop]);
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }

    var keys;

    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function (obj) {
            var i, res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }

    var defaultCalendar = {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[Last] dddd [at] LT',
        sameElse : 'L'
    };

    function calendar (key, mom, now) {
        var output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS  : 'h:mm:ss A',
        LT   : 'h:mm A',
        L    : 'MM/DD/YYYY',
        LL   : 'MMMM D, YYYY',
        LLL  : 'MMMM D, YYYY h:mm A',
        LLLL : 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat (key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate () {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultDayOfMonthOrdinalParse = /\d{1,2}/;

    function ordinal (number) {
        return this._ordinal.replace('%d', number);
    }

    var defaultRelativeTime = {
        future : 'in %s',
        past   : '%s ago',
        s  : 'a few seconds',
        ss : '%d seconds',
        m  : 'a minute',
        mm : '%d minutes',
        h  : 'an hour',
        hh : '%d hours',
        d  : 'a day',
        dd : '%d days',
        M  : 'a month',
        MM : '%d months',
        y  : 'a year',
        yy : '%d years'
    };

    function relativeTime (number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (isFunction(output)) ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture (diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    var aliases = {};

    function addUnitAlias (unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    var priorities = {};

    function addUnitPriority(unit, priority) {
        priorities[unit] = priority;
    }

    function getPrioritizedUnits(unitsObj) {
        var units = [];
        for (var u in unitsObj) {
            units.push({unit: u, priority: priorities[u]});
        }
        units.sort(function (a, b) {
            return a.priority - b.priority;
        });
        return units;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken (token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '', i;
            for (i = 0; i < length; i++) {
                output += isFunction(array[i]) ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1         = /\d/;            //       0 - 9
    var match2         = /\d\d/;          //      00 - 99
    var match3         = /\d{3}/;         //     000 - 999
    var match4         = /\d{4}/;         //    0000 - 9999
    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2      = /\d\d?/;         //       0 - 99
    var match3to4      = /\d\d\d\d?/;     //     999 - 9999
    var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    // includes scottish gaelic two word and hyphenated months
    var matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i;

    var regexes = {};

    function addRegexToken (token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken (token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }));
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken (token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (isNumber(callback)) {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken (token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    var WEEK = 7;
    var WEEKDAY = 8;

    // FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? '' + y : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PRIORITIES

    addUnitPriority('year', 1);

    // PARSING

    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear () {
        return isLeapYear(this.year());
    }

    function makeGetSet (unit, keepTime) {
        return function (value) {
            if (value != null) {
                set$1(this, unit, value);
                hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get(this, unit);
            }
        };
    }

    function get (mom, unit) {
        return mom.isValid() ?
            mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
    }

    function set$1 (mom, unit, value) {
        if (mom.isValid() && !isNaN(value)) {
            if (unit === 'FullYear' && isLeapYear(mom.year()) && mom.month() === 1 && mom.date() === 29) {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value, mom.month(), daysInMonth(value, mom.month()));
            }
            else {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
            }
        }
    }

    // MOMENTS

    function stringGet (units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units]();
        }
        return this;
    }


    function stringSet (units, value) {
        var this$1 = this;

        if (typeof units === 'object') {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units);
            for (var i = 0; i < prioritized.length; i++) {
                this$1[prioritized[i].unit](units[prioritized[i].unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    function mod(n, x) {
        return ((n % x) + x) % x;
    }

    var indexOf;

    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (o) {
            var this$1 = this;

            // I know
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this$1[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    function daysInMonth(year, month) {
        if (isNaN(year) || isNaN(month)) {
            return NaN;
        }
        var modMonth = mod(month, 12);
        year += (month - modMonth) / 12;
        return modMonth === 1 ? (isLeapYear(year) ? 29 : 28) : (31 - modMonth % 7 % 2);
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PRIORITY

    addUnitPriority('month', 8);

    // PARSING

    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m, format) {
        if (!m) {
            return isArray(this._months) ? this._months :
                this._months['standalone'];
        }
        return isArray(this._months) ? this._months[m.month()] :
            this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m, format) {
        if (!m) {
            return isArray(this._monthsShort) ? this._monthsShort :
                this._monthsShort['standalone'];
        }
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
            this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    function handleStrictParse(monthName, format, strict) {
        var this$1 = this;

        var i, ii, mom, llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            // this is not used
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = createUTC([2000, i]);
                this$1._shortMonthsParse[i] = this$1.monthsShort(mom, '').toLocaleLowerCase();
                this$1._longMonthsParse[i] = this$1.months(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse (monthName, format, strict) {
        var this$1 = this;

        var i, mom, regex;

        if (this._monthsParseExact) {
            return handleStrictParse.call(this, monthName, format, strict);
        }

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        // TODO: add sorting
        // Sorting makes sure if one month (or abbr) is a prefix of another
        // see sorting in computeMonthsParse
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            if (strict && !this$1._longMonthsParse[i]) {
                this$1._longMonthsParse[i] = new RegExp('^' + this$1.months(mom, '').replace('.', '') + '$', 'i');
                this$1._shortMonthsParse[i] = new RegExp('^' + this$1.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this$1._monthsParse[i]) {
                regex = '^' + this$1.months(mom, '') + '|^' + this$1.monthsShort(mom, '');
                this$1._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this$1._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this$1._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this$1._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth (mom, value) {
        var dayOfMonth;

        if (!mom.isValid()) {
            // No op
            return mom;
        }

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (!isNumber(value)) {
                    return mom;
                }
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth (value) {
        if (value != null) {
            setMonth(this, value);
            hooks.updateOffset(this, true);
            return this;
        } else {
            return get(this, 'Month');
        }
    }

    function getDaysInMonth () {
        return daysInMonth(this.year(), this.month());
    }

    var defaultMonthsShortRegex = matchWord;
    function monthsShortRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict ?
                this._monthsShortStrictRegex : this._monthsShortRegex;
        }
    }

    var defaultMonthsRegex = matchWord;
    function monthsRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict ?
                this._monthsStrictRegex : this._monthsRegex;
        }
    }

    function computeMonthsParse () {
        var this$1 = this;

        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            shortPieces.push(this$1.monthsShort(mom, ''));
            longPieces.push(this$1.months(mom, ''));
            mixedPieces.push(this$1.months(mom, ''));
            mixedPieces.push(this$1.monthsShort(mom, ''));
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
        }
        for (i = 0; i < 24; i++) {
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    }

    function createDate (y, m, d, h, M, s, ms) {
        // can't just apply() to create a date:
        // https://stackoverflow.com/q/181348
        var date;
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            date = new Date(y + 400, m, d, h, M, s, ms);
            if (isFinite(date.getFullYear())) {
                date.setFullYear(y);
            }
        } else {
            date = new Date(y, m, d, h, M, s, ms);
        }

        return date;
    }

    function createUTCDate (y) {
        var date;
        // the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            var args = Array.prototype.slice.call(arguments);
            // preserve leap years using a full 400 year cycle, then reset
            args[0] = y + 400;
            date = new Date(Date.UTC.apply(null, args));
            if (isFinite(date.getUTCFullYear())) {
                date.setUTCFullYear(y);
            }
        } else {
            date = new Date(Date.UTC.apply(null, arguments));
        }

        return date;
    }

    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,
            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

    // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear, resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek, resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

    // FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PRIORITIES

    addUnitPriority('week', 5);
    addUnitPriority('isoWeek', 5);

    // PARSING

    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // LOCALES

    function localeWeek (mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow : 0, // Sunday is the first day of the week.
        doy : 6  // The week that contains Jan 6th is the first week of the year.
    };

    function localeFirstDayOfWeek () {
        return this._week.dow;
    }

    function localeFirstDayOfYear () {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek (input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek (input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    // FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PRIORITY
    addUnitPriority('day', 11);
    addUnitPriority('weekday', 11);
    addUnitPriority('isoWeekday', 11);

    // PARSING

    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   function (isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd',   function (isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd',   function (isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    function parseIsoWeekday(input, locale) {
        if (typeof input === 'string') {
            return locale.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
    }

    // LOCALES
    function shiftWeekdays (ws, n) {
        return ws.slice(n, 7).concat(ws.slice(0, n));
    }

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m, format) {
        var weekdays = isArray(this._weekdays) ? this._weekdays :
            this._weekdays[(m && m !== true && this._weekdays.isFormat.test(format)) ? 'format' : 'standalone'];
        return (m === true) ? shiftWeekdays(weekdays, this._week.dow)
            : (m) ? weekdays[m.day()] : weekdays;
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
        return (m === true) ? shiftWeekdays(this._weekdaysShort, this._week.dow)
            : (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
        return (m === true) ? shiftWeekdays(this._weekdaysMin, this._week.dow)
            : (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
    }

    function handleStrictParse$1(weekdayName, format, strict) {
        var this$1 = this;

        var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];

            for (i = 0; i < 7; ++i) {
                mom = createUTC([2000, 1]).day(i);
                this$1._minWeekdaysParse[i] = this$1.weekdaysMin(mom, '').toLocaleLowerCase();
                this$1._shortWeekdaysParse[i] = this$1.weekdaysShort(mom, '').toLocaleLowerCase();
                this$1._weekdaysParse[i] = this$1.weekdays(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse (weekdayName, format, strict) {
        var this$1 = this;

        var i, mom, regex;

        if (this._weekdaysParseExact) {
            return handleStrictParse$1.call(this, weekdayName, format, strict);
        }

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = createUTC([2000, 1]).day(i);
            if (strict && !this$1._fullWeekdaysParse[i]) {
                this$1._fullWeekdaysParse[i] = new RegExp('^' + this$1.weekdays(mom, '').replace('.', '\\.?') + '$', 'i');
                this$1._shortWeekdaysParse[i] = new RegExp('^' + this$1.weekdaysShort(mom, '').replace('.', '\\.?') + '$', 'i');
                this$1._minWeekdaysParse[i] = new RegExp('^' + this$1.weekdaysMin(mom, '').replace('.', '\\.?') + '$', 'i');
            }
            if (!this$1._weekdaysParse[i]) {
                regex = '^' + this$1.weekdays(mom, '') + '|^' + this$1.weekdaysShort(mom, '') + '|^' + this$1.weekdaysMin(mom, '');
                this$1._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'dddd' && this$1._fullWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'ddd' && this$1._shortWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'dd' && this$1._minWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (!strict && this$1._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }

        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.

        if (input != null) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
            return this.day() || 7;
        }
    }

    var defaultWeekdaysRegex = matchWord;
    function weekdaysRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                this._weekdaysRegex = defaultWeekdaysRegex;
            }
            return this._weekdaysStrictRegex && isStrict ?
                this._weekdaysStrictRegex : this._weekdaysRegex;
        }
    }

    var defaultWeekdaysShortRegex = matchWord;
    function weekdaysShortRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
            }
            return this._weekdaysShortStrictRegex && isStrict ?
                this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
        }
    }

    var defaultWeekdaysMinRegex = matchWord;
    function weekdaysMinRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
            }
            return this._weekdaysMinStrictRegex && isStrict ?
                this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
        }
    }


    function computeWeekdaysParse () {
        var this$1 = this;

        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom, minp, shortp, longp;
        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, 1]).day(i);
            minp = this$1.weekdaysMin(mom, '');
            shortp = this$1.weekdaysShort(mom, '');
            longp = this$1.weekdays(mom, '');
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        // Sorting makes sure if one weekday (or abbr) is a prefix of another it
        // will match the longer piece.
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 7; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;

        this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
        this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
    }

    // FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    function meridiem (token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PRIORITY
    addUnitPriority('hour', 13);

    // PARSING

    function matchMeridiem (isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('k',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);
    addRegexToken('kk', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['k', 'kk'], function (input, array, config) {
        var kInput = toInt(input);
        array[HOUR] = kInput === 24 ? 0 : kInput;
    });
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    // LOCALES

    function localeIsPM (input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


    // MOMENTS

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour they want. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);

    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
        relativeTime: defaultRelativeTime,

        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,

        week: defaultLocaleWeek,

        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,

        meridiemParse: defaultLocaleMeridiemParse
    };

    // internal storage for locale config files
    var locales = {};
    var localeFamilies = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return globalLocale;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && ('object' !== 'undefined') &&
                module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                var aliasedRequire = commonjsRequire;
                aliasedRequire('./locale/' + name);
                getSetGlobalLocale(oldLocale);
            } catch (e) {}
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function getSetGlobalLocale (key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
            else {
                if ((typeof console !==  'undefined') && console.warn) {
                    //warn user if arguments are passed but the locale could not be set
                    console.warn('Locale ' + key +  ' not found. Did you forget to load it?');
                }
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale (name, config) {
        if (config !== null) {
            var locale, parentConfig = baseConfig;
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple('defineLocaleOverride',
                        'use moment.updateLocale(localeName, config) to change ' +
                        'an existing locale. moment.defineLocale(localeName, ' +
                        'config) should only be used for creating a new locale ' +
                        'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
                parentConfig = locales[name]._config;
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    parentConfig = locales[config.parentLocale]._config;
                } else {
                    locale = loadLocale(config.parentLocale);
                    if (locale != null) {
                        parentConfig = locale._config;
                    } else {
                        if (!localeFamilies[config.parentLocale]) {
                            localeFamilies[config.parentLocale] = [];
                        }
                        localeFamilies[config.parentLocale].push({
                            name: name,
                            config: config
                        });
                        return null;
                    }
                }
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));

            if (localeFamilies[name]) {
                localeFamilies[name].forEach(function (x) {
                    defineLocale(x.name, x.config);
                });
            }

            // backwards compat for now: also set the locale
            // make sure we set the locale AFTER all child locales have been
            // created, so we won't end up with the child locale set.
            getSetGlobalLocale(name);


            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale, tmpLocale, parentConfig = baseConfig;
            // MERGE
            tmpLocale = loadLocale(name);
            if (tmpLocale != null) {
                parentConfig = tmpLocale._config;
            }
            config = mergeConfigs(parentConfig, config);
            locale = new Locale(config);
            locale.parentLocale = locales[name];
            locales[name] = locale;

            // backwards compat for now: also set the locale
            getSetGlobalLocale(name);
        } else {
            // pass null for config to unupdate, useful for tests
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    // returns locale data
    function getLocale (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    function listLocales() {
        return keys(locales);
    }

    function checkOverflow (m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(hooks.now());
        if (config._useUTC) {
            return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray (config) {
        var i, date, input = [], currentDate, expectedWeekday, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear != null) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        expectedWeekday = config._useUTC ? config._d.getUTCDay() : config._d.getDay();

        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }

        // check for mismatching day of week
        if (config._w && typeof config._w.d !== 'undefined' && config._w.d !== expectedWeekday) {
            getParsingFlags(config).weekdayMismatch = true;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            var curWeek = weekOfYear(createLocal(), dow, doy);

            weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

            // Default to current week.
            week = defaults(w.w, curWeek.week);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from beginning of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to beginning of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
        ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
        ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
        ['YYYY-DDD', /\d{4}-\d{3}/],
        ['YYYY-MM', /\d{4}-\d\d/, false],
        ['YYYYYYMMDD', /[+-]\d{10}/],
        ['YYYYMMDD', /\d{8}/],
        // YYYYMM is NOT allowed by the standard
        ['GGGG[W]WWE', /\d{4}W\d{3}/],
        ['GGGG[W]WW', /\d{4}W\d{2}/, false],
        ['YYYYDDD', /\d{7}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
        ['HH:mm:ss', /\d\d:\d\d:\d\d/],
        ['HH:mm', /\d\d:\d\d/],
        ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
        ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
        ['HHmmss', /\d\d\d\d\d\d/],
        ['HHmm', /\d\d\d\d/],
        ['HH', /\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime, dateFormat, timeFormat, tzFormat;

        if (match) {
            getParsingFlags(config).iso = true;

            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
    var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/;

    function extractFromRFC2822Strings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
        var result = [
            untruncateYear(yearStr),
            defaultLocaleMonthsShort.indexOf(monthStr),
            parseInt(dayStr, 10),
            parseInt(hourStr, 10),
            parseInt(minuteStr, 10)
        ];

        if (secondStr) {
            result.push(parseInt(secondStr, 10));
        }

        return result;
    }

    function untruncateYear(yearStr) {
        var year = parseInt(yearStr, 10);
        if (year <= 49) {
            return 2000 + year;
        } else if (year <= 999) {
            return 1900 + year;
        }
        return year;
    }

    function preprocessRFC2822(s) {
        // Remove comments and folding whitespace and replace multiple-spaces with a single space
        return s.replace(/\([^)]*\)|[\n\t]/g, ' ').replace(/(\s\s+)/g, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }

    function checkWeekday(weekdayStr, parsedInput, config) {
        if (weekdayStr) {
            // TODO: Replace the vanilla JS Date object with an indepentent day-of-week check.
            var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                weekdayActual = new Date(parsedInput[0], parsedInput[1], parsedInput[2]).getDay();
            if (weekdayProvided !== weekdayActual) {
                getParsingFlags(config).weekdayMismatch = true;
                config._isValid = false;
                return false;
            }
        }
        return true;
    }

    var obsOffsets = {
        UT: 0,
        GMT: 0,
        EDT: -4 * 60,
        EST: -5 * 60,
        CDT: -5 * 60,
        CST: -6 * 60,
        MDT: -6 * 60,
        MST: -7 * 60,
        PDT: -7 * 60,
        PST: -8 * 60
    };

    function calculateOffset(obsOffset, militaryOffset, numOffset) {
        if (obsOffset) {
            return obsOffsets[obsOffset];
        } else if (militaryOffset) {
            // the only allowed military tz is Z
            return 0;
        } else {
            var hm = parseInt(numOffset, 10);
            var m = hm % 100, h = (hm - m) / 100;
            return h * 60 + m;
        }
    }

    // date and time from ref 2822 format
    function configFromRFC2822(config) {
        var match = rfc2822.exec(preprocessRFC2822(config._i));
        if (match) {
            var parsedArray = extractFromRFC2822Strings(match[4], match[3], match[2], match[5], match[6], match[7]);
            if (!checkWeekday(match[1], parsedArray, config)) {
                return;
            }

            config._a = parsedArray;
            config._tzm = calculateOffset(match[8], match[9], match[10]);

            config._d = createUTCDate.apply(null, config._a);
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

            getParsingFlags(config).rfc2822 = true;
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        configFromRFC2822(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        // Final attempt, use Input Fallback
        hooks.createFromInputFallback(config);
    }

    hooks.createFromInputFallback = deprecate(
        'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
        'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
        'discouraged and will be removed in an upcoming major release. Please refer to ' +
        'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // constant that refers to the ISO standard
    hooks.ISO_8601 = function () {};

    // constant that refers to the RFC 2822 form
    hooks.RFC_2822 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === hooks.ISO_8601) {
            configFromISO(config);
            return;
        }
        if (config._f === hooks.RFC_2822) {
            configFromRFC2822(config);
            return;
        }
        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            // console.log('token', token, 'parsedInput', parsedInput,
            //         'regex', getParseRegexForToken(token, config));
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (config._a[HOUR] <= 12 &&
            getParsingFlags(config).bigHour === true &&
            config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }

        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap (locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    // date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
            return obj && parseInt(obj, 10);
        });

        configFromArray(config);
    }

    function createFromConfig (config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig (config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return createInvalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isDate(input)) {
            config._d = input;
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        }  else {
            configFromInput(config);
        }

        if (!isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (isUndefined(input)) {
            config._d = new Date(hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (isObject(input)) {
            configFromObject(config);
        } else if (isNumber(input)) {
            // from milliseconds
            config._d = new Date(input);
        } else {
            hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC (input, format, locale, strict, isUTC) {
        var c = {};

        if (locale === true || locale === false) {
            strict = locale;
            locale = undefined;
        }

        if ((isObject(input) && isObjectEmpty(input)) ||
                (isArray(input) && input.length === 0)) {
            input = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function createLocal (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
        'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other < this ? this : other;
            } else {
                return createInvalid();
            }
        }
    );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other > this ? this : other;
            } else {
                return createInvalid();
            }
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function () {
        return Date.now ? Date.now() : +(new Date());
    };

    var ordering = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];

    function isDurationValid(m) {
        for (var key in m) {
            if (!(indexOf.call(ordering, key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
                return false;
            }
        }

        var unitHasDecimal = false;
        for (var i = 0; i < ordering.length; ++i) {
            if (m[ordering[i]]) {
                if (unitHasDecimal) {
                    return false; // only allow non-integers for smallest unit
                }
                if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                    unitHasDecimal = true;
                }
            }
        }

        return true;
    }

    function isValid$1() {
        return this._isValid;
    }

    function createInvalid$1() {
        return createDuration(NaN);
    }

    function Duration (duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || normalizedInput.isoWeek || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        this._isValid = isDurationValid(normalizedInput);

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible to translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = getLocale();

        this._bubble();
    }

    function isDuration (obj) {
        return obj instanceof Duration;
    }

    function absRound (number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    // FORMATTING

    function offset (token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z',  matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = (string || '').match(matcher);

        if (matches === null) {
            return null;
        }

        var chunk   = matches[matches.length - 1] || [];
        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return minutes === 0 ?
          0 :
          parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(res._d.valueOf() + diff);
            hooks.updateOffset(res, false);
            return res;
        } else {
            return createLocal(input).local();
        }
    }

    function getDateOffset (m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset (input, keepLocalTime, keepMinutes) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
                if (input === null) {
                    return this;
                }
            } else if (Math.abs(input) < 16 && !keepMinutes) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    addSubtract(this, createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone (input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC (keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal (keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset () {
        if (this._tzm != null) {
            this.utcOffset(this._tzm, false, true);
        } else if (typeof this._i === 'string') {
            var tZone = offsetFromString(matchOffset, this._i);
            if (tZone != null) {
                this.utcOffset(tZone);
            }
            else {
                this.utcOffset(0, true);
            }
        }
        return this;
    }

    function hasAlignedHourOffset (input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime () {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted () {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal () {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset () {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc () {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

    // ASP.NET json date format regex
    var aspNetRegex = /^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    // and further modified to allow for strings containing both week and day
    var isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

    function createDuration (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms : input._milliseconds,
                d  : input._days,
                M  : input._months
            };
        } else if (isNumber(input)) {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y  : 0,
                d  : toInt(match[DATE])                         * sign,
                h  : toInt(match[HOUR])                         * sign,
                m  : toInt(match[MINUTE])                       * sign,
                s  : toInt(match[SECOND])                       * sign,
                ms : toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
            };
        } else if (!!(match = isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y : parseIso(match[2], sign),
                M : parseIso(match[3], sign),
                w : parseIso(match[4], sign),
                d : parseIso(match[5], sign),
                h : parseIso(match[6], sign),
                m : parseIso(match[7], sign),
                s : parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    createDuration.fn = Duration.prototype;
    createDuration.invalid = createInvalid$1;

    function parseIso (inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return {milliseconds: 0, months: 0};
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
                'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = createDuration(val, period);
            addSubtract(this, dur, direction);
            return this;
        };
    }

    function addSubtract (mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (months) {
            setMonth(mom, get(mom, 'Month') + months * isAdding);
        }
        if (days) {
            set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
        }
        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (updateOffset) {
            hooks.updateOffset(mom, days || months);
        }
    }

    var add      = createAdder(1, 'add');
    var subtract = createAdder(-1, 'subtract');

    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, 'days', true);
        return diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
    }

    function calendar$1 (time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = hooks.calendarFormat(this, sod) || 'sameElse';

        var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);

        return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
    }

    function clone () {
        return new Moment(this);
    }

    function isAfter (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween (from, to, units, inclusivity) {
        var localFrom = isMoment(from) ? from : createLocal(from),
            localTo = isMoment(to) ? to : createLocal(to);
        if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
            return false;
        }
        inclusivity = inclusivity || '()';
        return (inclusivity[0] === '(' ? this.isAfter(localFrom, units) : !this.isBefore(localFrom, units)) &&
            (inclusivity[1] === ')' ? this.isBefore(localTo, units) : !this.isAfter(localTo, units));
    }

    function isSame (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
        }
    }

    function isSameOrAfter (input, units) {
        return this.isSame(input, units) || this.isAfter(input, units);
    }

    function isSameOrBefore (input, units) {
        return this.isSame(input, units) || this.isBefore(input, units);
    }

    function diff (input, units, asFloat) {
        var that,
            zoneDelta,
            output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        switch (units) {
            case 'year': output = monthDiff(this, that) / 12; break;
            case 'month': output = monthDiff(this, that); break;
            case 'quarter': output = monthDiff(this, that) / 3; break;
            case 'second': output = (this - that) / 1e3; break; // 1000
            case 'minute': output = (this - that) / 6e4; break; // 1000 * 60
            case 'hour': output = (this - that) / 36e5; break; // 1000 * 60 * 60
            case 'day': output = (this - that - zoneDelta) / 864e5; break; // 1000 * 60 * 60 * 24, negate dst
            case 'week': output = (this - that - zoneDelta) / 6048e5; break; // 1000 * 60 * 60 * 24 * 7, negate dst
            default: output = this - that;
        }

        return asFloat ? output : absFloor(output);
    }

    function monthDiff (a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        //check for negative zero, return zero if negative zero
        return -(wholeMonthDiff + adjust) || 0;
    }

    hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString () {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function toISOString(keepOffset) {
        if (!this.isValid()) {
            return null;
        }
        var utc = keepOffset !== true;
        var m = utc ? this.clone().utc() : this;
        if (m.year() < 0 || m.year() > 9999) {
            return formatMoment(m, utc ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ');
        }
        if (isFunction(Date.prototype.toISOString)) {
            // native implementation is ~50x faster, use it when we can
            if (utc) {
                return this.toDate().toISOString();
            } else {
                return new Date(this.valueOf() + this.utcOffset() * 60 * 1000).toISOString().replace('Z', formatMoment(m, 'Z'));
            }
        }
        return formatMoment(m, utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ');
    }

    /**
     * Return a human readable representation of a moment that can
     * also be evaluated to get a new moment which is the same
     *
     * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
     */
    function inspect () {
        if (!this.isValid()) {
            return 'moment.invalid(/* ' + this._i + ' */)';
        }
        var func = 'moment';
        var zone = '';
        if (!this.isLocal()) {
            func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
            zone = 'Z';
        }
        var prefix = '[' + func + '("]';
        var year = (0 <= this.year() && this.year() <= 9999) ? 'YYYY' : 'YYYYYY';
        var datetime = '-MM-DD[T]HH:mm:ss.SSS';
        var suffix = zone + '[")]';

        return this.format(prefix + year + datetime + suffix);
    }

    function format (inputString) {
        if (!inputString) {
            inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 createLocal(time).isValid())) {
            return createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow (withoutSuffix) {
        return this.from(createLocal(), withoutSuffix);
    }

    function to (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 createLocal(time).isValid())) {
            return createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow (withoutSuffix) {
        return this.to(createLocal(), withoutSuffix);
    }

    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function locale (key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData () {
        return this._locale;
    }

    var MS_PER_SECOND = 1000;
    var MS_PER_MINUTE = 60 * MS_PER_SECOND;
    var MS_PER_HOUR = 60 * MS_PER_MINUTE;
    var MS_PER_400_YEARS = (365 * 400 + 97) * 24 * MS_PER_HOUR;

    // actual modulo - handles negative numbers (for dates before 1970):
    function mod$1(dividend, divisor) {
        return (dividend % divisor + divisor) % divisor;
    }

    function localStartOfDate(y, m, d) {
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return new Date(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return new Date(y, m, d).valueOf();
        }
    }

    function utcStartOfDate(y, m, d) {
        // Date.UTC remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return Date.UTC(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return Date.UTC(y, m, d);
        }
    }

    function startOf (units) {
        var time;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        var startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year(), 0, 1);
                break;
            case 'quarter':
                time = startOfDate(this.year(), this.month() - this.month() % 3, 1);
                break;
            case 'month':
                time = startOfDate(this.year(), this.month(), 1);
                break;
            case 'week':
                time = startOfDate(this.year(), this.month(), this.date() - this.weekday());
                break;
            case 'isoWeek':
                time = startOfDate(this.year(), this.month(), this.date() - (this.isoWeekday() - 1));
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date());
                break;
            case 'hour':
                time = this._d.valueOf();
                time -= mod$1(time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE), MS_PER_HOUR);
                break;
            case 'minute':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_MINUTE);
                break;
            case 'second':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_SECOND);
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function endOf (units) {
        var time;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        var startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year() + 1, 0, 1) - 1;
                break;
            case 'quarter':
                time = startOfDate(this.year(), this.month() - this.month() % 3 + 3, 1) - 1;
                break;
            case 'month':
                time = startOfDate(this.year(), this.month() + 1, 1) - 1;
                break;
            case 'week':
                time = startOfDate(this.year(), this.month(), this.date() - this.weekday() + 7) - 1;
                break;
            case 'isoWeek':
                time = startOfDate(this.year(), this.month(), this.date() - (this.isoWeekday() - 1) + 7) - 1;
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date() + 1) - 1;
                break;
            case 'hour':
                time = this._d.valueOf();
                time += MS_PER_HOUR - mod$1(time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE), MS_PER_HOUR) - 1;
                break;
            case 'minute':
                time = this._d.valueOf();
                time += MS_PER_MINUTE - mod$1(time, MS_PER_MINUTE) - 1;
                break;
            case 'second':
                time = this._d.valueOf();
                time += MS_PER_SECOND - mod$1(time, MS_PER_SECOND) - 1;
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function valueOf () {
        return this._d.valueOf() - ((this._offset || 0) * 60000);
    }

    function unix () {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate () {
        return new Date(this.valueOf());
    }

    function toArray () {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject () {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function toJSON () {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null;
    }

    function isValid$2 () {
        return isValid(this);
    }

    function parsingFlags () {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt () {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
        };
    }

    // FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken (token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg',     'weekYear');
    addWeekYearFormatToken('ggggg',    'weekYear');
    addWeekYearFormatToken('GGGG',  'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PRIORITY

    addUnitPriority('weekYear', 1);
    addUnitPriority('isoWeekYear', 1);


    // PARSING

    addRegexToken('G',      matchSigned);
    addRegexToken('g',      matchSigned);
    addRegexToken('GG',     match1to2, match2);
    addRegexToken('gg',     match1to2, match2);
    addRegexToken('GGGG',   match1to4, match4);
    addRegexToken('gggg',   match1to4, match4);
    addRegexToken('GGGGG',  match1to6, match6);
    addRegexToken('ggggg',  match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = hooks.parseTwoDigitYear(input);
    });

    // MOMENTS

    function getSetWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input,
                this.week(),
                this.weekday(),
                this.localeData()._week.dow,
                this.localeData()._week.doy);
    }

    function getSetISOWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }

    function getISOWeeksInYear () {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear () {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

    // FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PRIORITY

    addUnitPriority('quarter', 7);

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter (input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    // FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PRIORITY
    addUnitPriority('date', 9);

    // PARSING

    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        // TODO: Remove "ordinalParse" fallback in next major release.
        return isStrict ?
          (locale._dayOfMonthOrdinalParse || locale._ordinalParse) :
          locale._dayOfMonthOrdinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0]);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    // FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PRIORITY
    addUnitPriority('dayOfYear', 4);

    // PARSING

    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    // MOMENTS

    function getSetDayOfYear (input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

    // FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PRIORITY

    addUnitPriority('minute', 14);

    // PARSING

    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    // FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PRIORITY

    addUnitPriority('second', 15);

    // PARSING

    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    // FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PRIORITY

    addUnitPriority('millisecond', 16);

    // PARSING

    addRegexToken('S',    match1to3, match1);
    addRegexToken('SS',   match1to3, match2);
    addRegexToken('SSS',  match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

    // FORMATTING

    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr () {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName () {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var proto = Moment.prototype;

    proto.add               = add;
    proto.calendar          = calendar$1;
    proto.clone             = clone;
    proto.diff              = diff;
    proto.endOf             = endOf;
    proto.format            = format;
    proto.from              = from;
    proto.fromNow           = fromNow;
    proto.to                = to;
    proto.toNow             = toNow;
    proto.get               = stringGet;
    proto.invalidAt         = invalidAt;
    proto.isAfter           = isAfter;
    proto.isBefore          = isBefore;
    proto.isBetween         = isBetween;
    proto.isSame            = isSame;
    proto.isSameOrAfter     = isSameOrAfter;
    proto.isSameOrBefore    = isSameOrBefore;
    proto.isValid           = isValid$2;
    proto.lang              = lang;
    proto.locale            = locale;
    proto.localeData        = localeData;
    proto.max               = prototypeMax;
    proto.min               = prototypeMin;
    proto.parsingFlags      = parsingFlags;
    proto.set               = stringSet;
    proto.startOf           = startOf;
    proto.subtract          = subtract;
    proto.toArray           = toArray;
    proto.toObject          = toObject;
    proto.toDate            = toDate;
    proto.toISOString       = toISOString;
    proto.inspect           = inspect;
    proto.toJSON            = toJSON;
    proto.toString          = toString;
    proto.unix              = unix;
    proto.valueOf           = valueOf;
    proto.creationData      = creationData;
    proto.year       = getSetYear;
    proto.isLeapYear = getIsLeapYear;
    proto.weekYear    = getSetWeekYear;
    proto.isoWeekYear = getSetISOWeekYear;
    proto.quarter = proto.quarters = getSetQuarter;
    proto.month       = getSetMonth;
    proto.daysInMonth = getDaysInMonth;
    proto.week           = proto.weeks        = getSetWeek;
    proto.isoWeek        = proto.isoWeeks     = getSetISOWeek;
    proto.weeksInYear    = getWeeksInYear;
    proto.isoWeeksInYear = getISOWeeksInYear;
    proto.date       = getSetDayOfMonth;
    proto.day        = proto.days             = getSetDayOfWeek;
    proto.weekday    = getSetLocaleDayOfWeek;
    proto.isoWeekday = getSetISODayOfWeek;
    proto.dayOfYear  = getSetDayOfYear;
    proto.hour = proto.hours = getSetHour;
    proto.minute = proto.minutes = getSetMinute;
    proto.second = proto.seconds = getSetSecond;
    proto.millisecond = proto.milliseconds = getSetMillisecond;
    proto.utcOffset            = getSetOffset;
    proto.utc                  = setOffsetToUTC;
    proto.local                = setOffsetToLocal;
    proto.parseZone            = setOffsetToParsedOffset;
    proto.hasAlignedHourOffset = hasAlignedHourOffset;
    proto.isDST                = isDaylightSavingTime;
    proto.isLocal              = isLocal;
    proto.isUtcOffset          = isUtcOffset;
    proto.isUtc                = isUtc;
    proto.isUTC                = isUtc;
    proto.zoneAbbr = getZoneAbbr;
    proto.zoneName = getZoneName;
    proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
    proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

    function createUnix (input) {
        return createLocal(input * 1000);
    }

    function createInZone () {
        return createLocal.apply(null, arguments).parseZone();
    }

    function preParsePostFormat (string) {
        return string;
    }

    var proto$1 = Locale.prototype;

    proto$1.calendar        = calendar;
    proto$1.longDateFormat  = longDateFormat;
    proto$1.invalidDate     = invalidDate;
    proto$1.ordinal         = ordinal;
    proto$1.preparse        = preParsePostFormat;
    proto$1.postformat      = preParsePostFormat;
    proto$1.relativeTime    = relativeTime;
    proto$1.pastFuture      = pastFuture;
    proto$1.set             = set;

    proto$1.months            =        localeMonths;
    proto$1.monthsShort       =        localeMonthsShort;
    proto$1.monthsParse       =        localeMonthsParse;
    proto$1.monthsRegex       = monthsRegex;
    proto$1.monthsShortRegex  = monthsShortRegex;
    proto$1.week = localeWeek;
    proto$1.firstDayOfYear = localeFirstDayOfYear;
    proto$1.firstDayOfWeek = localeFirstDayOfWeek;

    proto$1.weekdays       =        localeWeekdays;
    proto$1.weekdaysMin    =        localeWeekdaysMin;
    proto$1.weekdaysShort  =        localeWeekdaysShort;
    proto$1.weekdaysParse  =        localeWeekdaysParse;

    proto$1.weekdaysRegex       =        weekdaysRegex;
    proto$1.weekdaysShortRegex  =        weekdaysShortRegex;
    proto$1.weekdaysMinRegex    =        weekdaysMinRegex;

    proto$1.isPM = localeIsPM;
    proto$1.meridiem = localeMeridiem;

    function get$1 (format, index, field, setter) {
        var locale = getLocale();
        var utc = createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl (format, index, field) {
        if (isNumber(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return get$1(format, index, field, 'month');
        }

        var i;
        var out = [];
        for (i = 0; i < 12; i++) {
            out[i] = get$1(format, i, field, 'month');
        }
        return out;
    }

    // ()
    // (5)
    // (fmt, 5)
    // (fmt)
    // (true)
    // (true, 5)
    // (true, fmt, 5)
    // (true, fmt)
    function listWeekdaysImpl (localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;

            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        }

        var locale = getLocale(),
            shift = localeSorted ? locale._week.dow : 0;

        if (index != null) {
            return get$1(format, (index + shift) % 7, field, 'day');
        }

        var i;
        var out = [];
        for (i = 0; i < 7; i++) {
            out[i] = get$1(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function listMonths (format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function listMonthsShort (format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function listWeekdays (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function listWeekdaysShort (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function listWeekdaysMin (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }

    getSetGlobalLocale('en', {
        dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports

    hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', getSetGlobalLocale);
    hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', getLocale);

    var mathAbs = Math.abs;

    function abs () {
        var data           = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days         = mathAbs(this._days);
        this._months       = mathAbs(this._months);

        data.milliseconds  = mathAbs(data.milliseconds);
        data.seconds       = mathAbs(data.seconds);
        data.minutes       = mathAbs(data.minutes);
        data.hours         = mathAbs(data.hours);
        data.months        = mathAbs(data.months);
        data.years         = mathAbs(data.years);

        return this;
    }

    function addSubtract$1 (duration, input, value, direction) {
        var other = createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days         += direction * other._days;
        duration._months       += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function add$1 (input, value) {
        return addSubtract$1(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function subtract$1 (input, value) {
        return addSubtract$1(this, input, value, -1);
    }

    function absCeil (number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble () {
        var milliseconds = this._milliseconds;
        var days         = this._days;
        var months       = this._months;
        var data         = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds           = absFloor(milliseconds / 1000);
        data.seconds      = seconds % 60;

        minutes           = absFloor(seconds / 60);
        data.minutes      = minutes % 60;

        hours             = absFloor(minutes / 60);
        data.hours        = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days   = days;
        data.months = months;
        data.years  = years;

        return this;
    }

    function daysToMonths (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays (months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as (units) {
        if (!this.isValid()) {
            return NaN;
        }
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'quarter' || units === 'year') {
            days = this._days + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            switch (units) {
                case 'month':   return months;
                case 'quarter': return months / 3;
                case 'year':    return months / 12;
            }
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week'   : return days / 7     + milliseconds / 6048e5;
                case 'day'    : return days         + milliseconds / 864e5;
                case 'hour'   : return days * 24    + milliseconds / 36e5;
                case 'minute' : return days * 1440  + milliseconds / 6e4;
                case 'second' : return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function valueOf$1 () {
        if (!this.isValid()) {
            return NaN;
        }
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs (alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds      = makeAs('s');
    var asMinutes      = makeAs('m');
    var asHours        = makeAs('h');
    var asDays         = makeAs('d');
    var asWeeks        = makeAs('w');
    var asMonths       = makeAs('M');
    var asQuarters     = makeAs('Q');
    var asYears        = makeAs('y');

    function clone$1 () {
        return createDuration(this);
    }

    function get$2 (units) {
        units = normalizeUnits(units);
        return this.isValid() ? this[units + 's']() : NaN;
    }

    function makeGetter(name) {
        return function () {
            return this.isValid() ? this._data[name] : NaN;
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds      = makeGetter('seconds');
    var minutes      = makeGetter('minutes');
    var hours        = makeGetter('hours');
    var days         = makeGetter('days');
    var months       = makeGetter('months');
    var years        = makeGetter('years');

    function weeks () {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        ss: 44,         // a few seconds to seconds
        s : 45,         // seconds to minute
        m : 45,         // minutes to hour
        h : 22,         // hours to day
        d : 26,         // days to month
        M : 11          // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime$1 (posNegDuration, withoutSuffix, locale) {
        var duration = createDuration(posNegDuration).abs();
        var seconds  = round(duration.as('s'));
        var minutes  = round(duration.as('m'));
        var hours    = round(duration.as('h'));
        var days     = round(duration.as('d'));
        var months   = round(duration.as('M'));
        var years    = round(duration.as('y'));

        var a = seconds <= thresholds.ss && ['s', seconds]  ||
                seconds < thresholds.s   && ['ss', seconds] ||
                minutes <= 1             && ['m']           ||
                minutes < thresholds.m   && ['mm', minutes] ||
                hours   <= 1             && ['h']           ||
                hours   < thresholds.h   && ['hh', hours]   ||
                days    <= 1             && ['d']           ||
                days    < thresholds.d   && ['dd', days]    ||
                months  <= 1             && ['M']           ||
                months  < thresholds.M   && ['MM', months]  ||
                years   <= 1             && ['y']           || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set the rounding function for relative time strings
    function getSetRelativeTimeRounding (roundingFunction) {
        if (roundingFunction === undefined) {
            return round;
        }
        if (typeof(roundingFunction) === 'function') {
            round = roundingFunction;
            return true;
        }
        return false;
    }

    // This function allows you to set a threshold for relative time strings
    function getSetRelativeTimeThreshold (threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        if (threshold === 's') {
            thresholds.ss = limit - 1;
        }
        return true;
    }

    function humanize (withSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var locale = this.localeData();
        var output = relativeTime$1(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var abs$1 = Math.abs;

    function sign(x) {
        return ((x > 0) - (x < 0)) || +x;
    }

    function toISOString$1() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var seconds = abs$1(this._milliseconds) / 1000;
        var days         = abs$1(this._days);
        var months       = abs$1(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes           = absFloor(seconds / 60);
        hours             = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years  = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        var totalSign = total < 0 ? '-' : '';
        var ymSign = sign(this._months) !== sign(total) ? '-' : '';
        var daysSign = sign(this._days) !== sign(total) ? '-' : '';
        var hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

        return totalSign + 'P' +
            (Y ? ymSign + Y + 'Y' : '') +
            (M ? ymSign + M + 'M' : '') +
            (D ? daysSign + D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? hmsSign + h + 'H' : '') +
            (m ? hmsSign + m + 'M' : '') +
            (s ? hmsSign + s + 'S' : '');
    }

    var proto$2 = Duration.prototype;

    proto$2.isValid        = isValid$1;
    proto$2.abs            = abs;
    proto$2.add            = add$1;
    proto$2.subtract       = subtract$1;
    proto$2.as             = as;
    proto$2.asMilliseconds = asMilliseconds;
    proto$2.asSeconds      = asSeconds;
    proto$2.asMinutes      = asMinutes;
    proto$2.asHours        = asHours;
    proto$2.asDays         = asDays;
    proto$2.asWeeks        = asWeeks;
    proto$2.asMonths       = asMonths;
    proto$2.asQuarters     = asQuarters;
    proto$2.asYears        = asYears;
    proto$2.valueOf        = valueOf$1;
    proto$2._bubble        = bubble;
    proto$2.clone          = clone$1;
    proto$2.get            = get$2;
    proto$2.milliseconds   = milliseconds;
    proto$2.seconds        = seconds;
    proto$2.minutes        = minutes;
    proto$2.hours          = hours;
    proto$2.days           = days;
    proto$2.weeks          = weeks;
    proto$2.months         = months;
    proto$2.years          = years;
    proto$2.humanize       = humanize;
    proto$2.toISOString    = toISOString$1;
    proto$2.toString       = toISOString$1;
    proto$2.toJSON         = toISOString$1;
    proto$2.locale         = locale;
    proto$2.localeData     = localeData;

    proto$2.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', toISOString$1);
    proto$2.lang = lang;

    // Side effect imports

    // FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    // Side effect imports


    hooks.version = '2.24.0';

    setHookCallback(createLocal);

    hooks.fn                    = proto;
    hooks.min                   = min;
    hooks.max                   = max;
    hooks.now                   = now;
    hooks.utc                   = createUTC;
    hooks.unix                  = createUnix;
    hooks.months                = listMonths;
    hooks.isDate                = isDate;
    hooks.locale                = getSetGlobalLocale;
    hooks.invalid               = createInvalid;
    hooks.duration              = createDuration;
    hooks.isMoment              = isMoment;
    hooks.weekdays              = listWeekdays;
    hooks.parseZone             = createInZone;
    hooks.localeData            = getLocale;
    hooks.isDuration            = isDuration;
    hooks.monthsShort           = listMonthsShort;
    hooks.weekdaysMin           = listWeekdaysMin;
    hooks.defineLocale          = defineLocale;
    hooks.updateLocale          = updateLocale;
    hooks.locales               = listLocales;
    hooks.weekdaysShort         = listWeekdaysShort;
    hooks.normalizeUnits        = normalizeUnits;
    hooks.relativeTimeRounding  = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
    hooks.calendarFormat        = getCalendarFormat;
    hooks.prototype             = proto;

    // currently HTML5 input type only supports 24-hour formats
    hooks.HTML5_FMT = {
        DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm',             // <input type="datetime-local" />
        DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss',  // <input type="datetime-local" step="1" />
        DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS',   // <input type="datetime-local" step="0.001" />
        DATE: 'YYYY-MM-DD',                             // <input type="date" />
        TIME: 'HH:mm',                                  // <input type="time" />
        TIME_SECONDS: 'HH:mm:ss',                       // <input type="time" step="1" />
        TIME_MS: 'HH:mm:ss.SSS',                        // <input type="time" step="0.001" />
        WEEK: 'GGGG-[W]WW',                             // <input type="week" />
        MONTH: 'YYYY-MM'                                // <input type="month" />
    };

    return hooks;

})));
});

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/BaseNumber.html generated by Svelte v1.64.0 */

function step_(ref) {
    var step = ref.step;

    return step || 1;
}
function min_(ref) {
    var min = ref.min;

    return min !== undefined ? min : 0;
}
function max_(ref) {
    var max = ref.max;

    return max !== undefined ? max : 100;
}
function unit_(ref) {
    var unit = ref.unit;

    return unit !== undefined ? unit : '';
}
function slider_(ref) {
    var slider = ref.slider;

    return slider !== undefined ? slider : true;
}
function multiply_(ref) {
    var multiply = ref.multiply;

    return multiply || 1;
}
function data() {
    return {
        value2: null,
        unit: '',
        multiply: 1,
        width: '40px',
        min: 0,
        max: 100,
        disabled: false,
        step: 1
    };
}
var methods = {
    update: function update() {
        // update outside world value
        var ref = this.get();
        var value2 = ref.value2;
        var multiply_ = ref.multiply_;
        var step_ = ref.step_;
        var decimals = Math.max(0, -Math.floor(Math.log(step_ * multiply_) / Math.LN10));
        var value = +value2.toFixed(decimals) / multiply_;
        this.set({ value: value });
    },
    refresh: function refresh() {
        var ref = this.get();
        var value = ref.value;
        var multiply_ = ref.multiply_;
        var step_ = ref.step_;
        var decimals = Math.max(0, -Math.floor(Math.log(step_ * multiply_) / Math.LN10));
        var value2 = +(value * multiply_).toFixed(decimals);
        this.set({ value2: value2 });
    }
};

function onupdate(ref) {
    var this$1 = this;
    var changed = ref.changed;
    var current = ref.current;
    var previous = ref.previous;

    if (!this.refs.input) {
        // this is a workaround for a bug whereby the value is not initially set
        // in Number component which is wrapped in an if statement
        return setTimeout(function () {
            this$1.refresh();
        }, 0);
    }

    if (changed.value || !previous) {
        this.refresh();
    }
}
function create_main_fragment(component, state) {
	var input, input_updating = false, input_min_value, input_max_value, input_step_value, text, if_block_1_anchor;

	var if_block = (state.slider_) && create_if_block(component, state);

	function input_input_handler() {
		input_updating = true;
		component.set({ value2: toNumber(input.value) });
		input_updating = false;
	}

	function input_handler(event) {
		component.update();
	}

	var if_block_1 = (state.unit_) && create_if_block_1(component, state);

	return {
		c: function create() {
			if (if_block) { if_block.c(); }
			input = createElement("input");
			text = createText("\n");
			if (if_block_1) { if_block_1.c(); }
			if_block_1_anchor = createComment();
			this.h();
		},

		h: function hydrate() {
			addListener(input, "input", input_input_handler);
			addListener(input, "input", input_handler);
			setAttribute(input, "type", "number");
			input.min = input_min_value = state.min_*state.multiply_;
			input.disabled = state.disabled;
			input.max = input_max_value = state.max_*state.multiply_;
			input.step = input_step_value = state.step_*state.multiply_;
			setStyle(input, "width", "" + state.width + ( state.slider_?'margin-left:10px':'' ));
			input.className = "svelte-1ic9tw3";
		},

		m: function mount(target, anchor) {
			if (if_block) { if_block.m(target, anchor); }
			insertNode(input, target, anchor);
			component.refs.input = input;

			input.value = state.value2;

			insertNode(text, target, anchor);
			if (if_block_1) { if_block_1.m(target, anchor); }
			insertNode(if_block_1_anchor, target, anchor);
		},

		p: function update(changed, state) {
			if (state.slider_) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block(component, state);
					if_block.c();
					if_block.m(input.parentNode, input);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			if (!input_updating) { input.value = state.value2; }
			if ((changed.min_ || changed.multiply_) && input_min_value !== (input_min_value = state.min_*state.multiply_)) {
				input.min = input_min_value;
			}

			if (changed.disabled) {
				input.disabled = state.disabled;
			}

			if ((changed.max_ || changed.multiply_) && input_max_value !== (input_max_value = state.max_*state.multiply_)) {
				input.max = input_max_value;
			}

			if ((changed.step_ || changed.multiply_) && input_step_value !== (input_step_value = state.step_*state.multiply_)) {
				input.step = input_step_value;
			}

			if (changed.width || changed.slider_) {
				setStyle(input, "width", "" + state.width + ( state.slider_?'margin-left:10px':'' ));
			}

			if (state.unit_) {
				if (if_block_1) {
					if_block_1.p(changed, state);
				} else {
					if_block_1 = create_if_block_1(component, state);
					if_block_1.c();
					if_block_1.m(if_block_1_anchor.parentNode, if_block_1_anchor);
				}
			} else if (if_block_1) {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = null;
			}
		},

		u: function unmount() {
			if (if_block) { if_block.u(); }
			detachNode(input);
			detachNode(text);
			if (if_block_1) { if_block_1.u(); }
			detachNode(if_block_1_anchor);
		},

		d: function destroy$$1() {
			if (if_block) { if_block.d(); }
			removeListener(input, "input", input_input_handler);
			removeListener(input, "input", input_handler);
			if (component.refs.input === input) { component.refs.input = null; }
			if (if_block_1) { if_block_1.d(); }
		}
	};
}

// (1:0) {#if slider_}
function create_if_block(component, state) {
	var input, input_min_value, input_max_value, input_step_value, text;

	function input_input_handler() {
		component.set({ value2: toNumber(input.value) });
	}

	function input_change_handler() {
		component.set({ value2: toNumber(input.value) });
	}

	function input_handler(event) {
		component.update();
	}

	return {
		c: function create() {
			input = createElement("input");
			text = createText("  ");
			this.h();
		},

		h: function hydrate() {
			addListener(input, "input", input_input_handler);
			addListener(input, "change", input_change_handler);
			addListener(input, "input", input_handler);
			setAttribute(input, "type", "range");
			input.min = input_min_value = state.min_*state.multiply_;
			input.max = input_max_value = state.max_*state.multiply_;
			input.step = input_step_value = state.step_*state.multiply_;
			input.disabled = state.disabled;
			input.className = "svelte-1ic9tw3";
		},

		m: function mount(target, anchor) {
			insertNode(input, target, anchor);

			input.value = state.value2;

			insertNode(text, target, anchor);
		},

		p: function update(changed, state) {
			input.value = state.value2;
			input.value = state.value2;
			if ((changed.min_ || changed.multiply_) && input_min_value !== (input_min_value = state.min_*state.multiply_)) {
				input.min = input_min_value;
			}

			if ((changed.max_ || changed.multiply_) && input_max_value !== (input_max_value = state.max_*state.multiply_)) {
				input.max = input_max_value;
			}

			if ((changed.step_ || changed.multiply_) && input_step_value !== (input_step_value = state.step_*state.multiply_)) {
				input.step = input_step_value;
			}

			if (changed.disabled) {
				input.disabled = state.disabled;
			}
		},

		u: function unmount() {
			detachNode(input);
			detachNode(text);
		},

		d: function destroy$$1() {
			removeListener(input, "input", input_input_handler);
			removeListener(input, "change", input_change_handler);
			removeListener(input, "input", input_handler);
		}
	};
}

// (20:0) {#if unit_}
function create_if_block_1(component, state) {
	var span, text;

	return {
		c: function create() {
			span = createElement("span");
			text = createText(state.unit_);
			this.h();
		},

		h: function hydrate() {
			span.className = "unit svelte-1ic9tw3";
		},

		m: function mount(target, anchor) {
			insertNode(span, target, anchor);
			appendNode(text, span);
		},

		p: function update(changed, state) {
			if (changed.unit_) {
				text.data = state.unit_;
			}
		},

		u: function unmount() {
			detachNode(span);
		},

		d: noop
	};
}

function BaseNumber(options) {
	this._debugName = '<BaseNumber>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this.refs = {};
	this._state = assign(data(), options.data);
	this._recompute({ step: 1, min: 1, max: 1, unit: 1, slider: 1, multiply: 1 }, this._state);
	if (!('step' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'step'"); }
	if (!('min' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'min'"); }
	if (!('max' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'max'"); }
	if (!('unit' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'unit'"); }
	if (!('slider' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'slider'"); }
	if (!('multiply' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'multiply'"); }





	if (!('disabled' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'disabled'"); }
	if (!('value2' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'value2'"); }
	if (!('width' in this._state)) { console.warn("<BaseNumber> was created without expected data property 'width'"); }
	this._handlers.update = [onupdate];

	var self = this;
	var _oncreate = function() {
		var changed = { step: 1, min: 1, max: 1, unit: 1, slider: 1, multiply: 1, slider_: 1, min_: 1, multiply_: 1, max_: 1, step_: 1, disabled: 1, value2: 1, width: 1, unit_: 1 };
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

assign(BaseNumber.prototype, protoDev);
assign(BaseNumber.prototype, methods);

BaseNumber.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('step_' in newState && !this._updatingReadonlyProperty) { throw new Error("<BaseNumber>: Cannot set read-only property 'step_'"); }
	if ('min_' in newState && !this._updatingReadonlyProperty) { throw new Error("<BaseNumber>: Cannot set read-only property 'min_'"); }
	if ('max_' in newState && !this._updatingReadonlyProperty) { throw new Error("<BaseNumber>: Cannot set read-only property 'max_'"); }
	if ('unit_' in newState && !this._updatingReadonlyProperty) { throw new Error("<BaseNumber>: Cannot set read-only property 'unit_'"); }
	if ('slider_' in newState && !this._updatingReadonlyProperty) { throw new Error("<BaseNumber>: Cannot set read-only property 'slider_'"); }
	if ('multiply_' in newState && !this._updatingReadonlyProperty) { throw new Error("<BaseNumber>: Cannot set read-only property 'multiply_'"); }
};

BaseNumber.prototype._recompute = function _recompute(changed, state) {
	if (changed.step) {
		if (this._differs(state.step_, (state.step_ = step_(state)))) { changed.step_ = true; }
	}

	if (changed.min) {
		if (this._differs(state.min_, (state.min_ = min_(state)))) { changed.min_ = true; }
	}

	if (changed.max) {
		if (this._differs(state.max_, (state.max_ = max_(state)))) { changed.max_ = true; }
	}

	if (changed.unit) {
		if (this._differs(state.unit_, (state.unit_ = unit_(state)))) { changed.unit_ = true; }
	}

	if (changed.slider) {
		if (this._differs(state.slider_, (state.slider_ = slider_(state)))) { changed.slider_ = true; }
	}

	if (changed.multiply) {
		if (this._differs(state.multiply_, (state.multiply_ = multiply_(state)))) { changed.multiply_ = true; }
	}
};

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/BaseDropdown.html generated by Svelte v1.64.0 */

function data$1() {
    return {
        visible: false,
        disabled: false,
        width: 'auto'
    };
}
var methods$1 = {
    toggle: function toggle(event) {
        event.preventDefault();
        var ref = this.get();
        var visible = ref.visible;
        var disabled = ref.disabled;
        if (disabled) { return; }
        this.set({ visible: !visible });
    },
    windowClick: function windowClick(event) {
        if (
            !event.target ||
            (this.refs && this.refs.button && (event.target === this.refs.button || this.refs.button.contains(event.target)))
        )
            { return; }
        // this is a hack for the colorpicker, need to find out how to get rid of
        if (event.target.classList.contains('hex')) { return; }
        this.set({ visible: false });
    }
};

function create_main_fragment$1(component, state) {
	var div, a, slot_content_button = component._slotted.button, button, i, i_class_value, text_2;

	function onwindowclick(event) {
		component.windowClick(event);
	}
	window.addEventListener("click", onwindowclick);

	function click_handler(event) {
		component.toggle(event);
	}

	var if_block = (state.visible) && create_if_block$1(component, state);

	return {
		c: function create() {
			div = createElement("div");
			a = createElement("a");
			if (!slot_content_button) {
				button = createElement("button");
				i = createElement("i");
			}
			text_2 = createText("\n    ");
			if (if_block) { if_block.c(); }
			this.h();
		},

		h: function hydrate() {
			if (!slot_content_button) {
				i.className = i_class_value = "fa fa-chevron-" + (state.visible ? 'up' : 'down') + " svelte-ne6xrp";
				button.className = "btn btn-small";
			}
			addListener(a, "click", click_handler);
			a.href = "#dropdown-btn";
			a.className = "base-drop-btn svelte-ne6xrp";
			setStyle(div, "position", "relative");
			setStyle(div, "display", "inline-block");
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(a, div);
			if (!slot_content_button) {
				appendNode(button, a);
				appendNode(i, button);
			}

			else {
				appendNode(slot_content_button, a);
			}

			component.refs.button = a;
			appendNode(text_2, div);
			if (if_block) { if_block.m(div, null); }
		},

		p: function update(changed, state) {
			if (!slot_content_button) {
				if ((changed.visible) && i_class_value !== (i_class_value = "fa fa-chevron-" + (state.visible ? 'up' : 'down') + " svelte-ne6xrp")) {
					i.className = i_class_value;
			}

			}

			if (state.visible) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$1(component, state);
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

			if (slot_content_button) {
				reinsertChildren(a, slot_content_button);
			}

			if (if_block) { if_block.u(); }
		},

		d: function destroy$$1() {
			window.removeEventListener("click", onwindowclick);

			removeListener(a, "click", click_handler);
			if (component.refs.button === a) { component.refs.button = null; }
			if (if_block) { if_block.d(); }
		}
	};
}

// (9:4) {#if visible}
function create_if_block$1(component, state) {
	var div, slot_content_content = component._slotted.content, div_1;

	return {
		c: function create() {
			div = createElement("div");
			if (!slot_content_content) {
				div_1 = createElement("div");
				div_1.textContent = "Dropdown content";
			}
			this.h();
		},

		h: function hydrate() {
			if (!slot_content_content) {
				div_1.className = "base-dropdown-inner svelte-ne6xrp";
			}
			setStyle(div, "width", state.width);
			div.className = "dropdown-menu base-dropdown-content svelte-ne6xrp";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			if (!slot_content_content) {
				appendNode(div_1, div);
			}

			else {
				appendNode(slot_content_content, div);
			}
		},

		p: function update(changed, state) {
			if (changed.width) {
				setStyle(div, "width", state.width);
			}
		},

		u: function unmount() {
			detachNode(div);

			if (slot_content_content) {
				reinsertChildren(div, slot_content_content);
			}
		},

		d: noop
	};
}

function BaseDropdown(options) {
	this._debugName = '<BaseDropdown>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this.refs = {};
	this._state = assign(data$1(), options.data);
	if (!('visible' in this._state)) { console.warn("<BaseDropdown> was created without expected data property 'visible'"); }
	if (!('width' in this._state)) { console.warn("<BaseDropdown> was created without expected data property 'width'"); }

	this._slotted = options.slots || {};

	this.slots = {};

	this._fragment = create_main_fragment$1(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(BaseDropdown.prototype, protoDev);
assign(BaseDropdown.prototype, methods$1);

BaseDropdown.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/BaseToggleButton.html generated by Svelte v1.64.0 */

function data$2() {
    return {
        value: false,
        indeterminate: false,
        notoggle: false,
        disabled: false
    };
}
var methods$2 = {
    toggle: function toggle() {
        this.fire('select');
        var ref = this.get();
        var value = ref.value;
        var notoggle = ref.notoggle;
        if (!notoggle) {
            this.set({ value: !value, indeterminate: false });
        }
    }
};

function create_main_fragment$2(component, state) {
	var button, slot_content_default = component._slotted.default, text;

	function click_handler(event) {
		component.toggle();
	}

	return {
		c: function create() {
			button = createElement("button");
			if (!slot_content_default) {
				text = createText("x");
			}
			this.h();
		},

		h: function hydrate() {
			addListener(button, "click", click_handler);
			setAttribute(button, "class:indeterminate", true);
			setAttribute(button, "class:btn-toggled", "value && !indeterminate");
			button.className = "btn btn-s svelte-6n3kq9";
			button.disabled = state.disabled;
		},

		m: function mount(target, anchor) {
			insertNode(button, target, anchor);
			if (!slot_content_default) {
				appendNode(text, button);
			}

			else {
				appendNode(slot_content_default, button);
			}
		},

		p: function update(changed, state) {
			if (changed.disabled) {
				button.disabled = state.disabled;
			}
		},

		u: function unmount() {
			detachNode(button);

			if (slot_content_default) {
				reinsertChildren(button, slot_content_default);
			}
		},

		d: function destroy$$1() {
			removeListener(button, "click", click_handler);
		}
	};
}

function BaseToggleButton(options) {
	this._debugName = '<BaseToggleButton>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data$2(), options.data);
	if (!('disabled' in this._state)) { console.warn("<BaseToggleButton> was created without expected data property 'disabled'"); }

	this._slotted = options.slots || {};

	this.slots = {};

	this._fragment = create_main_fragment$2(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(BaseToggleButton.prototype, protoDev);
assign(BaseToggleButton.prototype, methods$2);

BaseToggleButton.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

function cubicOut(t) {
  var f = t - 1.0;
  return f * f * f + 1.0
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

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/Checkbox.html generated by Svelte v1.64.0 */

function data$3() {
    return {
        value: false,
        disabled: false,
        faded: false,
        indeterminate: false,
        disabled_msg: ''
    };
}
function create_main_fragment$3(component, state) {
	var div, label, input, span, text, text_1, label_class_value, text_3;

	function input_change_handler() {
		component.set({ value: input.checked, indeterminate: input.indeterminate });
	}

	var if_block = (state.disabled && state.disabled_msg) && create_if_block$2(component, state);

	return {
		c: function create() {
			div = createElement("div");
			label = createElement("label");
			input = createElement("input");
			span = createElement("span");
			text = createText("\n         ");
			text_1 = createText(state.label);
			text_3 = createText("\n    ");
			if (if_block) { if_block.c(); }
			this.h();
		},

		h: function hydrate() {
			addListener(input, "change", input_change_handler);
			if (!('value' in state && 'indeterminate' in state)) { component.root._beforecreate.push(input_change_handler); }
			setAttribute(input, "type", "checkbox");
			input.disabled = state.disabled;
			input.className = "svelte-v385kn";
			span.className = "css-ui svelte-v385kn";
			label.className = label_class_value = "checkbox " + (state.disabled? 'disabled' :'') + " " + (state.faded? 'faded' :'') + " svelte-v385kn";
			div.className = "control-group vis-option-group vis-option-type-checkbox";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(label, div);
			appendNode(input, label);

			input.checked = state.value;
			input.indeterminate = state.indeterminate ;

			appendNode(span, label);
			appendNode(text, label);
			appendNode(text_1, label);
			appendNode(text_3, div);
			if (if_block) { if_block.i(div, null); }
		},

		p: function update(changed, state) {
			input.checked = state.value;
			input.indeterminate = state.indeterminate ;
			if (changed.disabled) {
				input.disabled = state.disabled;
			}

			if (changed.label) {
				text_1.data = state.label;
			}

			if ((changed.disabled || changed.faded) && label_class_value !== (label_class_value = "checkbox " + (state.disabled? 'disabled' :'') + " " + (state.faded? 'faded' :'') + " svelte-v385kn")) {
				label.className = label_class_value;
			}

			if (state.disabled && state.disabled_msg) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$2(component, state);
					if (if_block) { if_block.c(); }
				}

				if_block.i(div, null);
			} else if (if_block) {
				if_block.o(function() {
					if_block.u();
					if_block.d();
					if_block = null;
				});
			}
		},

		u: function unmount() {
			detachNode(div);
			if (if_block) { if_block.u(); }
		},

		d: function destroy$$1() {
			removeListener(input, "change", input_change_handler);
			if (if_block) { if_block.d(); }
		}
	};
}

// (6:4) {#if disabled && disabled_msg}
function create_if_block$2(component, state) {
	var div, div_1, div_transition, introing, outroing;

	return {
		c: function create() {
			div = createElement("div");
			div_1 = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div_1.className = "disabled-msg svelte-v385kn";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(div_1, div);
			div_1.innerHTML = state.disabled_msg;
		},

		p: function update(changed, state) {
			if (outroing || changed.disabled_msg) {
				div_1.innerHTML = state.disabled_msg;
			}
		},

		i: function intro(target, anchor) {
			if (introing) { return; }
			introing = true;
			outroing = false;

			component.root._aftercreate.push(function() {
				if (!div_transition) { div_transition = wrapTransition(component, div, slide, {}, true, null); }
				div_transition.run(true, function() {
					component.fire("intro.end", { node: div });
				});
			});

			this.m(target, anchor);
		},

		o: function outro(outrocallback) {
			if (outroing) { return; }
			outroing = true;
			introing = false;

			var outros = 1;

			div_transition.run(false, function() {
				component.fire("outro.end", { node: div });
				if (--outros === 0) { outrocallback(); }
				div_transition = null;
			});
		},

		u: function unmount() {
			div_1.innerHTML = '';

			detachNode(div);
		},

		d: noop
	};
}

function Checkbox(options) {
	this._debugName = '<Checkbox>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data$3(), options.data);
	if (!('disabled' in this._state)) { console.warn("<Checkbox> was created without expected data property 'disabled'"); }
	if (!('faded' in this._state)) { console.warn("<Checkbox> was created without expected data property 'faded'"); }
	if (!('value' in this._state)) { console.warn("<Checkbox> was created without expected data property 'value'"); }
	if (!('indeterminate' in this._state)) { console.warn("<Checkbox> was created without expected data property 'indeterminate'"); }
	if (!('label' in this._state)) { console.warn("<Checkbox> was created without expected data property 'label'"); }
	if (!('disabled_msg' in this._state)) { console.warn("<Checkbox> was created without expected data property 'disabled_msg'"); }

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$3(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._beforecreate);
		callAll(this._aftercreate);
	}
}

assign(Checkbox.prototype, protoDev);

Checkbox.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

var chroma = createCommonjsModule(function (module, exports) {
/**
 * chroma.js - JavaScript library for color conversions
 *
 * Copyright (c) 2011-2018, Gregor Aisch
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

(function (global, factory) {
    module.exports = factory();
}(commonjsGlobal, (function () {
    var limit = function (x, min, max) {
        if ( min === void 0 ) { min=0; }
        if ( max === void 0 ) { max=1; }

        return x < min ? min : x > max ? max : x;
    };

    var clip_rgb = function (rgb) {
        rgb._clipped = false;
        rgb._unclipped = rgb.slice(0);
        for (var i=0; i<=3; i++) {
            if (i < 3) {
                if (rgb[i] < 0 || rgb[i] > 255) { rgb._clipped = true; }
                rgb[i] = limit(rgb[i], 0, 255);
            } else if (i === 3) {
                rgb[i] = limit(rgb[i], 0, 1);
            }
        }
        return rgb;
    };

    // ported from jQuery's $.type
    var classToType = {};
    for (var i = 0, list = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Undefined', 'Null']; i < list.length; i += 1) {
        var name = list[i];

        classToType[("[object " + name + "]")] = name.toLowerCase();
    }
    var type = function(obj) {
        return classToType[Object.prototype.toString.call(obj)] || "object";
    };

    var unpack = function (args, keyOrder) {
        if ( keyOrder === void 0 ) { keyOrder=null; }

    	// if called with more than 3 arguments, we return the arguments
        if (args.length >= 3) { return Array.prototype.slice.call(args); }
        // with less than 3 args we check if first arg is object
        // and use the keyOrder string to extract and sort properties
    	if (type(args[0]) == 'object' && keyOrder) {
    		return keyOrder.split('')
    			.filter(function (k) { return args[0][k] !== undefined; })
    			.map(function (k) { return args[0][k]; });
    	}
    	// otherwise we just return the first argument
    	// (which we suppose is an array of args)
        return args[0];
    };

    var last = function (args) {
        if (args.length < 2) { return null; }
        var l = args.length-1;
        if (type(args[l]) == 'string') { return args[l].toLowerCase(); }
        return null;
    };

    var PI = Math.PI;

    var utils = {
    	clip_rgb: clip_rgb,
    	limit: limit,
    	type: type,
    	unpack: unpack,
    	last: last,
    	PI: PI,
    	TWOPI: PI*2,
    	PITHIRD: PI/3,
    	DEG2RAD: PI / 180,
    	RAD2DEG: 180 / PI
    };

    var input = {
    	format: {},
    	autodetect: []
    };

    var last$1 = utils.last;
    var clip_rgb$1 = utils.clip_rgb;
    var type$1 = utils.type;


    var Color = function Color() {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        var me = this;
        if (type$1(args[0]) === 'object' &&
            args[0].constructor &&
            args[0].constructor === this.constructor) {
            // the argument is already a Color instance
            return args[0];
        }

        // last argument could be the mode
        var mode = last$1(args);
        var autodetect = false;

        if (!mode) {
            autodetect = true;
            if (!input.sorted) {
                input.autodetect = input.autodetect.sort(function (a,b) { return b.p - a.p; });
                input.sorted = true;
            }
            // auto-detect format
            for (var i = 0, list = input.autodetect; i < list.length; i += 1) {
                var chk = list[i];

                mode = chk.test.apply(chk, args);
                if (mode) { break; }
            }
        }

        if (input.format[mode]) {
            var rgb = input.format[mode].apply(null, autodetect ? args : args.slice(0,-1));
            me._rgb = clip_rgb$1(rgb);
        } else {
            throw new Error('unknown format: '+args);
        }

        // add alpha channel
        if (me._rgb.length === 3) { me._rgb.push(1); }
    };

    Color.prototype.toString = function toString () {
        if (type$1(this.hex) == 'function') { return this.hex(); }
        return ("[" + (this._rgb.join(',')) + "]");
    };

    var Color_1 = Color;

    var chroma = function () {
    	var arguments$1 = arguments;

    	var args = [], len = arguments.length;
    	while ( len-- ) { args[ len ] = arguments$1[ len ]; }

    	return new (Function.prototype.bind.apply( chroma.Color, [ null ].concat( args) ));
    };

    chroma.Color = Color_1;
    chroma.version = '2.0.3';

    var chroma_1 = chroma;

    var unpack$1 = utils.unpack;
    var max = Math.max;

    var rgb2cmyk = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        var ref = unpack$1(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        r = r / 255;
        g = g / 255;
        b = b / 255;
        var k = 1 - max(r,max(g,b));
        var f = k < 1 ? 1 / (1-k) : 0;
        var c = (1-r-k) * f;
        var m = (1-g-k) * f;
        var y = (1-b-k) * f;
        return [c,m,y,k];
    };

    var rgb2cmyk_1 = rgb2cmyk;

    var unpack$2 = utils.unpack;

    var cmyk2rgb = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        args = unpack$2(args, 'cmyk');
        var c = args[0];
        var m = args[1];
        var y = args[2];
        var k = args[3];
        var alpha = args.length > 4 ? args[4] : 1;
        if (k === 1) { return [0,0,0,alpha]; }
        return [
            c >= 1 ? 0 : 255 * (1-c) * (1-k), // r
            m >= 1 ? 0 : 255 * (1-m) * (1-k), // g
            y >= 1 ? 0 : 255 * (1-y) * (1-k), // b
            alpha
        ];
    };

    var cmyk2rgb_1 = cmyk2rgb;

    var unpack$3 = utils.unpack;
    var type$2 = utils.type;



    Color_1.prototype.cmyk = function() {
        return rgb2cmyk_1(this._rgb);
    };

    chroma_1.cmyk = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['cmyk']) ));
    };

    input.format.cmyk = cmyk2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var arguments$1 = arguments;

            var args = [], len = arguments.length;
            while ( len-- ) { args[ len ] = arguments$1[ len ]; }

            args = unpack$3(args, 'cmyk');
            if (type$2(args) === 'array' && args.length === 4) {
                return 'cmyk';
            }
        }
    });

    var unpack$4 = utils.unpack;
    var last$2 = utils.last;
    var rnd = function (a) { return Math.round(a*100)/100; };

    /*
     * supported arguments:
     * - hsl2css(h,s,l)
     * - hsl2css(h,s,l,a)
     * - hsl2css([h,s,l], mode)
     * - hsl2css([h,s,l,a], mode)
     * - hsl2css({h,s,l,a}, mode)
     */
    var hsl2css = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        var hsla = unpack$4(args, 'hsla');
        var mode = last$2(args) || 'lsa';
        hsla[0] = rnd(hsla[0] || 0);
        hsla[1] = rnd(hsla[1]*100) + '%';
        hsla[2] = rnd(hsla[2]*100) + '%';
        if (mode === 'hsla' || (hsla.length > 3 && hsla[3]<1)) {
            hsla[3] = hsla.length > 3 ? hsla[3] : 1;
            mode = 'hsla';
        } else {
            hsla.length = 3;
        }
        return (mode + "(" + (hsla.join(',')) + ")");
    };

    var hsl2css_1 = hsl2css;

    var unpack$5 = utils.unpack;

    /*
     * supported arguments:
     * - rgb2hsl(r,g,b)
     * - rgb2hsl(r,g,b,a)
     * - rgb2hsl([r,g,b])
     * - rgb2hsl([r,g,b,a])
     * - rgb2hsl({r,g,b,a})
     */
    var rgb2hsl = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        args = unpack$5(args, 'rgba');
        var r = args[0];
        var g = args[1];
        var b = args[2];

        r /= 255;
        g /= 255;
        b /= 255;

        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);

        var l = (max + min) / 2;
        var s, h;

        if (max === min){
            s = 0;
            h = Number.NaN;
        } else {
            s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
        }

        if (r == max) { h = (g - b) / (max - min); }
        else if (g == max) { h = 2 + (b - r) / (max - min); }
        else if (b == max) { h = 4 + (r - g) / (max - min); }

        h *= 60;
        if (h < 0) { h += 360; }
        if (args.length>3 && args[3]!==undefined) { return [h,s,l,args[3]]; }
        return [h,s,l];
    };

    var rgb2hsl_1 = rgb2hsl;

    var unpack$6 = utils.unpack;
    var last$3 = utils.last;


    var round = Math.round;

    /*
     * supported arguments:
     * - rgb2css(r,g,b)
     * - rgb2css(r,g,b,a)
     * - rgb2css([r,g,b], mode)
     * - rgb2css([r,g,b,a], mode)
     * - rgb2css({r,g,b,a}, mode)
     */
    var rgb2css = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        var rgba = unpack$6(args, 'rgba');
        var mode = last$3(args) || 'rgb';
        if (mode.substr(0,3) == 'hsl') {
            return hsl2css_1(rgb2hsl_1(rgba), mode);
        }
        rgba[0] = round(rgba[0]);
        rgba[1] = round(rgba[1]);
        rgba[2] = round(rgba[2]);
        if (mode === 'rgba' || (rgba.length > 3 && rgba[3]<1)) {
            rgba[3] = rgba.length > 3 ? rgba[3] : 1;
            mode = 'rgba';
        }
        return (mode + "(" + (rgba.slice(0,mode==='rgb'?3:4).join(',')) + ")");
    };

    var rgb2css_1 = rgb2css;

    var RE_HEX = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    var RE_HEXA = /^#?([A-Fa-f0-9]{8})$/;

    var hex2rgb = function (hex) {
        if (hex.match(RE_HEX)) {
            // remove optional leading #
            if (hex.length === 4 || hex.length === 7) {
                hex = hex.substr(1);
            }
            // expand short-notation to full six-digit
            if (hex.length === 3) {
                hex = hex.split('');
                hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
            }
            var u = parseInt(hex, 16);
            var r = u >> 16;
            var g = u >> 8 & 0xFF;
            var b = u & 0xFF;
            return [r,g,b,1];
        }

        // match rgba hex format, eg #FF000077
        if (hex.match(RE_HEXA)) {
            if (hex.length === 9) {
                // remove optional leading #
                hex = hex.substr(1);
            }
            var u$1 = parseInt(hex, 16);
            var r$1 = u$1 >> 24 & 0xFF;
            var g$1 = u$1 >> 16 & 0xFF;
            var b$1 = u$1 >> 8 & 0xFF;
            var a = Math.round((u$1 & 0xFF) / 0xFF * 100) / 100;
            return [r$1,g$1,b$1,a];
        }

        // we used to check for css colors here
        // if _input.css? and rgb = _input.css hex
        //     return rgb

        throw new Error(("unknown hex color: " + hex));
    };

    var hex2rgb_1 = hex2rgb;

    var unpack$7 = utils.unpack;
    var round$1 = Math.round;

    var hsl2rgb = function () {
        var arguments$1 = arguments;

        var assign;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }
        args = unpack$7(args, 'hsl');
        var h = args[0];
        var s = args[1];
        var l = args[2];
        var r,g,b;
        if (s === 0) {
            r = g = b = l*255;
        } else {
            var t3 = [0,0,0];
            var c = [0,0,0];
            var t2 = l < 0.5 ? l * (1+s) : l+s-l*s;
            var t1 = 2 * l - t2;
            var h_ = h / 360;
            t3[0] = h_ + 1/3;
            t3[1] = h_;
            t3[2] = h_ - 1/3;
            for (var i=0; i<3; i++) {
                if (t3[i] < 0) { t3[i] += 1; }
                if (t3[i] > 1) { t3[i] -= 1; }
                if (6 * t3[i] < 1)
                    { c[i] = t1 + (t2 - t1) * 6 * t3[i]; }
                else if (2 * t3[i] < 1)
                    { c[i] = t2; }
                else if (3 * t3[i] < 2)
                    { c[i] = t1 + (t2 - t1) * ((2 / 3) - t3[i]) * 6; }
                else
                    { c[i] = t1; }
            }
            (assign = [round$1(c[0]*255),round$1(c[1]*255),round$1(c[2]*255)], r = assign[0], g = assign[1], b = assign[2]);
        }
        if (args.length > 3) {
            // keep alpha channel
            return [r,g,b,args[3]];
        }
        return [r,g,b,1];
    };

    var hsl2rgb_1 = hsl2rgb;

    /**
    	X11 color names

    	http://www.w3.org/TR/css3-color/#svg-color
    */

    var w3cx11 = {
        aliceblue: '#f0f8ff',
        antiquewhite: '#faebd7',
        aqua: '#00ffff',
        aquamarine: '#7fffd4',
        azure: '#f0ffff',
        beige: '#f5f5dc',
        bisque: '#ffe4c4',
        black: '#000000',
        blanchedalmond: '#ffebcd',
        blue: '#0000ff',
        blueviolet: '#8a2be2',
        brown: '#a52a2a',
        burlywood: '#deb887',
        cadetblue: '#5f9ea0',
        chartreuse: '#7fff00',
        chocolate: '#d2691e',
        coral: '#ff7f50',
        cornflower: '#6495ed',
        cornflowerblue: '#6495ed',
        cornsilk: '#fff8dc',
        crimson: '#dc143c',
        cyan: '#00ffff',
        darkblue: '#00008b',
        darkcyan: '#008b8b',
        darkgoldenrod: '#b8860b',
        darkgray: '#a9a9a9',
        darkgreen: '#006400',
        darkgrey: '#a9a9a9',
        darkkhaki: '#bdb76b',
        darkmagenta: '#8b008b',
        darkolivegreen: '#556b2f',
        darkorange: '#ff8c00',
        darkorchid: '#9932cc',
        darkred: '#8b0000',
        darksalmon: '#e9967a',
        darkseagreen: '#8fbc8f',
        darkslateblue: '#483d8b',
        darkslategray: '#2f4f4f',
        darkslategrey: '#2f4f4f',
        darkturquoise: '#00ced1',
        darkviolet: '#9400d3',
        deeppink: '#ff1493',
        deepskyblue: '#00bfff',
        dimgray: '#696969',
        dimgrey: '#696969',
        dodgerblue: '#1e90ff',
        firebrick: '#b22222',
        floralwhite: '#fffaf0',
        forestgreen: '#228b22',
        fuchsia: '#ff00ff',
        gainsboro: '#dcdcdc',
        ghostwhite: '#f8f8ff',
        gold: '#ffd700',
        goldenrod: '#daa520',
        gray: '#808080',
        green: '#008000',
        greenyellow: '#adff2f',
        grey: '#808080',
        honeydew: '#f0fff0',
        hotpink: '#ff69b4',
        indianred: '#cd5c5c',
        indigo: '#4b0082',
        ivory: '#fffff0',
        khaki: '#f0e68c',
        laserlemon: '#ffff54',
        lavender: '#e6e6fa',
        lavenderblush: '#fff0f5',
        lawngreen: '#7cfc00',
        lemonchiffon: '#fffacd',
        lightblue: '#add8e6',
        lightcoral: '#f08080',
        lightcyan: '#e0ffff',
        lightgoldenrod: '#fafad2',
        lightgoldenrodyellow: '#fafad2',
        lightgray: '#d3d3d3',
        lightgreen: '#90ee90',
        lightgrey: '#d3d3d3',
        lightpink: '#ffb6c1',
        lightsalmon: '#ffa07a',
        lightseagreen: '#20b2aa',
        lightskyblue: '#87cefa',
        lightslategray: '#778899',
        lightslategrey: '#778899',
        lightsteelblue: '#b0c4de',
        lightyellow: '#ffffe0',
        lime: '#00ff00',
        limegreen: '#32cd32',
        linen: '#faf0e6',
        magenta: '#ff00ff',
        maroon: '#800000',
        maroon2: '#7f0000',
        maroon3: '#b03060',
        mediumaquamarine: '#66cdaa',
        mediumblue: '#0000cd',
        mediumorchid: '#ba55d3',
        mediumpurple: '#9370db',
        mediumseagreen: '#3cb371',
        mediumslateblue: '#7b68ee',
        mediumspringgreen: '#00fa9a',
        mediumturquoise: '#48d1cc',
        mediumvioletred: '#c71585',
        midnightblue: '#191970',
        mintcream: '#f5fffa',
        mistyrose: '#ffe4e1',
        moccasin: '#ffe4b5',
        navajowhite: '#ffdead',
        navy: '#000080',
        oldlace: '#fdf5e6',
        olive: '#808000',
        olivedrab: '#6b8e23',
        orange: '#ffa500',
        orangered: '#ff4500',
        orchid: '#da70d6',
        palegoldenrod: '#eee8aa',
        palegreen: '#98fb98',
        paleturquoise: '#afeeee',
        palevioletred: '#db7093',
        papayawhip: '#ffefd5',
        peachpuff: '#ffdab9',
        peru: '#cd853f',
        pink: '#ffc0cb',
        plum: '#dda0dd',
        powderblue: '#b0e0e6',
        purple: '#800080',
        purple2: '#7f007f',
        purple3: '#a020f0',
        rebeccapurple: '#663399',
        red: '#ff0000',
        rosybrown: '#bc8f8f',
        royalblue: '#4169e1',
        saddlebrown: '#8b4513',
        salmon: '#fa8072',
        sandybrown: '#f4a460',
        seagreen: '#2e8b57',
        seashell: '#fff5ee',
        sienna: '#a0522d',
        silver: '#c0c0c0',
        skyblue: '#87ceeb',
        slateblue: '#6a5acd',
        slategray: '#708090',
        slategrey: '#708090',
        snow: '#fffafa',
        springgreen: '#00ff7f',
        steelblue: '#4682b4',
        tan: '#d2b48c',
        teal: '#008080',
        thistle: '#d8bfd8',
        tomato: '#ff6347',
        turquoise: '#40e0d0',
        violet: '#ee82ee',
        wheat: '#f5deb3',
        white: '#ffffff',
        whitesmoke: '#f5f5f5',
        yellow: '#ffff00',
        yellowgreen: '#9acd32'
    };

    var w3cx11_1 = w3cx11;

    var RE_RGB = /^rgb\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/;
    var RE_RGBA = /^rgba\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*([01]|[01]?\.\d+)\)$/;
    var RE_RGB_PCT = /^rgb\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
    var RE_RGBA_PCT = /^rgba\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;
    var RE_HSL = /^hsl\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
    var RE_HSLA = /^hsla\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;

    var round$2 = Math.round;

    var css2rgb = function (css) {
        css = css.toLowerCase().trim();
        // named X11 colors
        if (w3cx11_1[css]) {
            return hex2rgb_1(w3cx11_1[css]);
        }
        var m;

        // rgb(250,20,0)
        if ((m = css.match(RE_RGB))) {
            var rgb = m.slice(1,4);
            for (var i=0; i<3; i++) {
                rgb[i] = +rgb[i];
            }
            rgb[3] = 1;  // default alpha
            return rgb;
        }

        // rgba(250,20,0,0.4)
        if ((m = css.match(RE_RGBA))) {
            var rgb$1 = m.slice(1,5);
            for (var i$1=0; i$1<4; i$1++) {
                rgb$1[i$1] = +rgb$1[i$1];
            }
            return rgb$1;
        }

        // rgb(100%,0%,0%)
        if ((m = css.match(RE_RGB_PCT))) {
            var rgb$2 = m.slice(1,4);
            for (var i$2=0; i$2<3; i$2++) {
                rgb$2[i$2] = round$2(rgb$2[i$2] * 2.55);
            }
            rgb$2[3] = 1;  // default alpha
            return rgb$2;
        }

        // rgba(100%,0%,0%,0.4)
        if ((m = css.match(RE_RGBA_PCT))) {
            var rgb$3 = m.slice(1,5);
            for (var i$3=0; i$3<3; i$3++) {
                rgb$3[i$3] = round$2(rgb$3[i$3] * 2.55);
            }
            rgb$3[3] = +rgb$3[3];
            return rgb$3;
        }

        // hsl(0,100%,50%)
        if ((m = css.match(RE_HSL))) {
            var hsl = m.slice(1,4);
            hsl[1] *= 0.01;
            hsl[2] *= 0.01;
            var rgb$4 = hsl2rgb_1(hsl);
            rgb$4[3] = 1;
            return rgb$4;
        }

        // hsla(0,100%,50%,0.5)
        if ((m = css.match(RE_HSLA))) {
            var hsl$1 = m.slice(1,4);
            hsl$1[1] *= 0.01;
            hsl$1[2] *= 0.01;
            var rgb$5 = hsl2rgb_1(hsl$1);
            rgb$5[3] = +m[4];  // default alpha = 1
            return rgb$5;
        }
    };

    css2rgb.test = function (s) {
        return RE_RGB.test(s) ||
            RE_RGBA.test(s) ||
            RE_RGB_PCT.test(s) ||
            RE_RGBA_PCT.test(s) ||
            RE_HSL.test(s) ||
            RE_HSLA.test(s);
    };

    var css2rgb_1 = css2rgb;

    var type$3 = utils.type;




    Color_1.prototype.css = function(mode) {
        return rgb2css_1(this._rgb, mode);
    };

    chroma_1.css = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['css']) ));
    };

    input.format.css = css2rgb_1;

    input.autodetect.push({
        p: 5,
        test: function (h) {
            var arguments$1 = arguments;

            var rest = [], len = arguments.length - 1;
            while ( len-- > 0 ) { rest[ len ] = arguments$1[ len + 1 ]; }

            if (!rest.length && type$3(h) === 'string' && css2rgb_1.test(h)) {
                return 'css';
            }
        }
    });

    var unpack$8 = utils.unpack;

    input.format.gl = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        var rgb = unpack$8(args, 'rgba');
        rgb[0] *= 255;
        rgb[1] *= 255;
        rgb[2] *= 255;
        return rgb;
    };

    chroma_1.gl = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['gl']) ));
    };

    Color_1.prototype.gl = function() {
        var rgb = this._rgb;
        return [rgb[0]/255, rgb[1]/255, rgb[2]/255, rgb[3]];
    };

    var unpack$9 = utils.unpack;

    var rgb2hcg = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        var ref = unpack$9(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);
        var delta = max - min;
        var c = delta * 100 / 255;
        var _g = min / (255 - delta) * 100;
        var h;
        if (delta === 0) {
            h = Number.NaN;
        } else {
            if (r === max) { h = (g - b) / delta; }
            if (g === max) { h = 2+(b - r) / delta; }
            if (b === max) { h = 4+(r - g) / delta; }
            h *= 60;
            if (h < 0) { h += 360; }
        }
        return [h, c, _g];
    };

    var rgb2hcg_1 = rgb2hcg;

    var unpack$a = utils.unpack;
    var floor = Math.floor;

    /*
     * this is basically just HSV with some minor tweaks
     *
     * hue.. [0..360]
     * chroma .. [0..1]
     * grayness .. [0..1]
     */

    var hcg2rgb = function () {
        var arguments$1 = arguments;

        var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }
        args = unpack$a(args, 'hcg');
        var h = args[0];
        var c = args[1];
        var _g = args[2];
        var r,g,b;
        _g = _g * 255;
        var _c = c * 255;
        if (c === 0) {
            r = g = b = _g;
        } else {
            if (h === 360) { h = 0; }
            if (h > 360) { h -= 360; }
            if (h < 0) { h += 360; }
            h /= 60;
            var i = floor(h);
            var f = h - i;
            var p = _g * (1 - c);
            var q = p + _c * (1 - f);
            var t = p + _c * f;
            var v = p + _c;
            switch (i) {
                case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
                case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
                case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
                case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
                case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
                case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
            }
        }
        return [r, g, b, args.length > 3 ? args[3] : 1];
    };

    var hcg2rgb_1 = hcg2rgb;

    var unpack$b = utils.unpack;
    var type$4 = utils.type;






    Color_1.prototype.hcg = function() {
        return rgb2hcg_1(this._rgb);
    };

    chroma_1.hcg = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hcg']) ));
    };

    input.format.hcg = hcg2rgb_1;

    input.autodetect.push({
        p: 1,
        test: function () {
            var arguments$1 = arguments;

            var args = [], len = arguments.length;
            while ( len-- ) { args[ len ] = arguments$1[ len ]; }

            args = unpack$b(args, 'hcg');
            if (type$4(args) === 'array' && args.length === 3) {
                return 'hcg';
            }
        }
    });

    var unpack$c = utils.unpack;
    var last$4 = utils.last;
    var round$3 = Math.round;

    var rgb2hex = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        var ref = unpack$c(args, 'rgba');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var a = ref[3];
        var mode = last$4(args) || 'auto';
        if (a === undefined) { a = 1; }
        if (mode === 'auto') {
            mode = a < 1 ? 'rgba' : 'rgb';
        }
        r = round$3(r);
        g = round$3(g);
        b = round$3(b);
        var u = r << 16 | g << 8 | b;
        var str = "000000" + u.toString(16); //#.toUpperCase();
        str = str.substr(str.length - 6);
        var hxa = '0' + round$3(a * 255).toString(16);
        hxa = hxa.substr(hxa.length - 2);
        switch (mode.toLowerCase()) {
            case 'rgba': return ("#" + str + hxa);
            case 'argb': return ("#" + hxa + str);
            default: return ("#" + str);
        }
    };

    var rgb2hex_1 = rgb2hex;

    var type$5 = utils.type;




    Color_1.prototype.hex = function(mode) {
        return rgb2hex_1(this._rgb, mode);
    };

    chroma_1.hex = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hex']) ));
    };

    input.format.hex = hex2rgb_1;
    input.autodetect.push({
        p: 4,
        test: function (h) {
            var arguments$1 = arguments;

            var rest = [], len = arguments.length - 1;
            while ( len-- > 0 ) { rest[ len ] = arguments$1[ len + 1 ]; }

            if (!rest.length && type$5(h) === 'string' && [3,4,6,7,8,9].includes(h.length)) {
                return 'hex';
            }
        }
    });

    var unpack$d = utils.unpack;
    var TWOPI = utils.TWOPI;
    var min = Math.min;
    var sqrt = Math.sqrt;
    var acos = Math.acos;

    var rgb2hsi = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        /*
        borrowed from here:
        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/rgb2hsi.cpp
        */
        var ref = unpack$d(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        r /= 255;
        g /= 255;
        b /= 255;
        var h;
        var min_ = min(r,g,b);
        var i = (r+g+b) / 3;
        var s = i > 0 ? 1 - min_/i : 0;
        if (s === 0) {
            h = NaN;
        } else {
            h = ((r-g)+(r-b)) / 2;
            h /= sqrt((r-g)*(r-g) + (r-b)*(g-b));
            h = acos(h);
            if (b > g) {
                h = TWOPI - h;
            }
            h /= TWOPI;
        }
        return [h*360,s,i];
    };

    var rgb2hsi_1 = rgb2hsi;

    var unpack$e = utils.unpack;
    var limit$1 = utils.limit;
    var TWOPI$1 = utils.TWOPI;
    var PITHIRD = utils.PITHIRD;
    var cos = Math.cos;

    /*
     * hue [0..360]
     * saturation [0..1]
     * intensity [0..1]
     */
    var hsi2rgb = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        /*
        borrowed from here:
        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
        */
        args = unpack$e(args, 'hsi');
        var h = args[0];
        var s = args[1];
        var i = args[2];
        var r,g,b;

        if (isNaN(h)) { h = 0; }
        if (isNaN(s)) { s = 0; }
        // normalize hue
        if (h > 360) { h -= 360; }
        if (h < 0) { h += 360; }
        h /= 360;
        if (h < 1/3) {
            b = (1-s)/3;
            r = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
            g = 1 - (b+r);
        } else if (h < 2/3) {
            h -= 1/3;
            r = (1-s)/3;
            g = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
            b = 1 - (r+g);
        } else {
            h -= 2/3;
            g = (1-s)/3;
            b = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
            r = 1 - (g+b);
        }
        r = limit$1(i*r*3);
        g = limit$1(i*g*3);
        b = limit$1(i*b*3);
        return [r*255, g*255, b*255, args.length > 3 ? args[3] : 1];
    };

    var hsi2rgb_1 = hsi2rgb;

    var unpack$f = utils.unpack;
    var type$6 = utils.type;






    Color_1.prototype.hsi = function() {
        return rgb2hsi_1(this._rgb);
    };

    chroma_1.hsi = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsi']) ));
    };

    input.format.hsi = hsi2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var arguments$1 = arguments;

            var args = [], len = arguments.length;
            while ( len-- ) { args[ len ] = arguments$1[ len ]; }

            args = unpack$f(args, 'hsi');
            if (type$6(args) === 'array' && args.length === 3) {
                return 'hsi';
            }
        }
    });

    var unpack$g = utils.unpack;
    var type$7 = utils.type;






    Color_1.prototype.hsl = function() {
        return rgb2hsl_1(this._rgb);
    };

    chroma_1.hsl = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsl']) ));
    };

    input.format.hsl = hsl2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var arguments$1 = arguments;

            var args = [], len = arguments.length;
            while ( len-- ) { args[ len ] = arguments$1[ len ]; }

            args = unpack$g(args, 'hsl');
            if (type$7(args) === 'array' && args.length === 3) {
                return 'hsl';
            }
        }
    });

    var unpack$h = utils.unpack;
    var min$1 = Math.min;
    var max$1 = Math.max;

    /*
     * supported arguments:
     * - rgb2hsv(r,g,b)
     * - rgb2hsv([r,g,b])
     * - rgb2hsv({r,g,b})
     */
    var rgb2hsl$1 = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        args = unpack$h(args, 'rgb');
        var r = args[0];
        var g = args[1];
        var b = args[2];
        var min_ = min$1(r, g, b);
        var max_ = max$1(r, g, b);
        var delta = max_ - min_;
        var h,s,v;
        v = max_ / 255.0;
        if (max_ === 0) {
            h = Number.NaN;
            s = 0;
        } else {
            s = delta / max_;
            if (r === max_) { h = (g - b) / delta; }
            if (g === max_) { h = 2+(b - r) / delta; }
            if (b === max_) { h = 4+(r - g) / delta; }
            h *= 60;
            if (h < 0) { h += 360; }
        }
        return [h, s, v]
    };

    var rgb2hsv = rgb2hsl$1;

    var unpack$i = utils.unpack;
    var floor$1 = Math.floor;

    var hsv2rgb = function () {
        var arguments$1 = arguments;

        var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }
        args = unpack$i(args, 'hsv');
        var h = args[0];
        var s = args[1];
        var v = args[2];
        var r,g,b;
        v *= 255;
        if (s === 0) {
            r = g = b = v;
        } else {
            if (h === 360) { h = 0; }
            if (h > 360) { h -= 360; }
            if (h < 0) { h += 360; }
            h /= 60;

            var i = floor$1(h);
            var f = h - i;
            var p = v * (1 - s);
            var q = v * (1 - s * f);
            var t = v * (1 - s * (1 - f));

            switch (i) {
                case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
                case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
                case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
                case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
                case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
                case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
            }
        }
        return [r,g,b,args.length > 3?args[3]:1];
    };

    var hsv2rgb_1 = hsv2rgb;

    var unpack$j = utils.unpack;
    var type$8 = utils.type;






    Color_1.prototype.hsv = function() {
        return rgb2hsv(this._rgb);
    };

    chroma_1.hsv = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsv']) ));
    };

    input.format.hsv = hsv2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var arguments$1 = arguments;

            var args = [], len = arguments.length;
            while ( len-- ) { args[ len ] = arguments$1[ len ]; }

            args = unpack$j(args, 'hsv');
            if (type$8(args) === 'array' && args.length === 3) {
                return 'hsv';
            }
        }
    });

    var labConstants = {
        // Corresponds roughly to RGB brighter/darker
        Kn: 18,

        // D65 standard referent
        Xn: 0.950470,
        Yn: 1,
        Zn: 1.088830,

        t0: 0.137931034,  // 4 / 29
        t1: 0.206896552,  // 6 / 29
        t2: 0.12841855,   // 3 * t1 * t1
        t3: 0.008856452,  // t1 * t1 * t1
    };

    var unpack$k = utils.unpack;
    var pow = Math.pow;

    var rgb2lab = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        var ref = unpack$k(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var ref$1 = rgb2xyz(r,g,b);
        var x = ref$1[0];
        var y = ref$1[1];
        var z = ref$1[2];
        var l = 116 * y - 16;
        return [l < 0 ? 0 : l, 500 * (x - y), 200 * (y - z)];
    };

    var rgb_xyz = function (r) {
        if ((r /= 255) <= 0.04045) { return r / 12.92; }
        return pow((r + 0.055) / 1.055, 2.4);
    };

    var xyz_lab = function (t) {
        if (t > labConstants.t3) { return pow(t, 1 / 3); }
        return t / labConstants.t2 + labConstants.t0;
    };

    var rgb2xyz = function (r,g,b) {
        r = rgb_xyz(r);
        g = rgb_xyz(g);
        b = rgb_xyz(b);
        var x = xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / labConstants.Xn);
        var y = xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / labConstants.Yn);
        var z = xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / labConstants.Zn);
        return [x,y,z];
    };

    var rgb2lab_1 = rgb2lab;

    var unpack$l = utils.unpack;
    var pow$1 = Math.pow;

    /*
     * L* [0..100]
     * a [-100..100]
     * b [-100..100]
     */
    var lab2rgb = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        args = unpack$l(args, 'lab');
        var l = args[0];
        var a = args[1];
        var b = args[2];
        var x,y,z, r,g,b_;

        y = (l + 16) / 116;
        x = isNaN(a) ? y : y + a / 500;
        z = isNaN(b) ? y : y - b / 200;

        y = labConstants.Yn * lab_xyz(y);
        x = labConstants.Xn * lab_xyz(x);
        z = labConstants.Zn * lab_xyz(z);

        r = xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);  // D65 -> sRGB
        g = xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z);
        b_ = xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);

        return [r,g,b_,args.length > 3 ? args[3] : 1];
    };

    var xyz_rgb = function (r) {
        return 255 * (r <= 0.00304 ? 12.92 * r : 1.055 * pow$1(r, 1 / 2.4) - 0.055)
    };

    var lab_xyz = function (t) {
        return t > labConstants.t1 ? t * t * t : labConstants.t2 * (t - labConstants.t0)
    };

    var lab2rgb_1 = lab2rgb;

    var unpack$m = utils.unpack;
    var type$9 = utils.type;






    Color_1.prototype.lab = function() {
        return rgb2lab_1(this._rgb);
    };

    chroma_1.lab = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['lab']) ));
    };

    input.format.lab = lab2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var arguments$1 = arguments;

            var args = [], len = arguments.length;
            while ( len-- ) { args[ len ] = arguments$1[ len ]; }

            args = unpack$m(args, 'lab');
            if (type$9(args) === 'array' && args.length === 3) {
                return 'lab';
            }
        }
    });

    var unpack$n = utils.unpack;
    var RAD2DEG = utils.RAD2DEG;
    var sqrt$1 = Math.sqrt;
    var atan2 = Math.atan2;
    var round$4 = Math.round;

    var lab2lch = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        var ref = unpack$n(args, 'lab');
        var l = ref[0];
        var a = ref[1];
        var b = ref[2];
        var c = sqrt$1(a * a + b * b);
        var h = (atan2(b, a) * RAD2DEG + 360) % 360;
        if (round$4(c*10000) === 0) { h = Number.NaN; }
        return [l, c, h];
    };

    var lab2lch_1 = lab2lch;

    var unpack$o = utils.unpack;



    var rgb2lch = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        var ref = unpack$o(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var ref$1 = rgb2lab_1(r,g,b);
        var l = ref$1[0];
        var a = ref$1[1];
        var b_ = ref$1[2];
        return lab2lch_1(l,a,b_);
    };

    var rgb2lch_1 = rgb2lch;

    var unpack$p = utils.unpack;
    var DEG2RAD = utils.DEG2RAD;
    var sin = Math.sin;
    var cos$1 = Math.cos;

    var lch2lab = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        /*
        Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
        These formulas were invented by David Dalrymple to obtain maximum contrast without going
        out of gamut if the parameters are in the range 0-1.

        A saturation multiplier was added by Gregor Aisch
        */
        var ref = unpack$p(args, 'lch');
        var l = ref[0];
        var c = ref[1];
        var h = ref[2];
        if (isNaN(h)) { h = 0; }
        h = h * DEG2RAD;
        return [l, cos$1(h) * c, sin(h) * c]
    };

    var lch2lab_1 = lch2lab;

    var unpack$q = utils.unpack;



    var lch2rgb = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        args = unpack$q(args, 'lch');
        var l = args[0];
        var c = args[1];
        var h = args[2];
        var ref = lch2lab_1 (l,c,h);
        var L = ref[0];
        var a = ref[1];
        var b_ = ref[2];
        var ref$1 = lab2rgb_1 (L,a,b_);
        var r = ref$1[0];
        var g = ref$1[1];
        var b = ref$1[2];
        return [r, g, b, args.length > 3 ? args[3] : 1];
    };

    var lch2rgb_1 = lch2rgb;

    var unpack$r = utils.unpack;


    var hcl2rgb = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        var hcl = unpack$r(args, 'hcl').reverse();
        return lch2rgb_1.apply(void 0, hcl);
    };

    var hcl2rgb_1 = hcl2rgb;

    var unpack$s = utils.unpack;
    var type$a = utils.type;






    Color_1.prototype.lch = function() { return rgb2lch_1(this._rgb); };
    Color_1.prototype.hcl = function() { return rgb2lch_1(this._rgb).reverse(); };

    chroma_1.lch = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['lch']) ));
    };
    chroma_1.hcl = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hcl']) ));
    };

    input.format.lch = lch2rgb_1;
    input.format.hcl = hcl2rgb_1;

    ['lch','hcl'].forEach(function (m) { return input.autodetect.push({
        p: 2,
        test: function () {
            var arguments$1 = arguments;

            var args = [], len = arguments.length;
            while ( len-- ) { args[ len ] = arguments$1[ len ]; }

            args = unpack$s(args, m);
            if (type$a(args) === 'array' && args.length === 3) {
                return m;
            }
        }
    }); });

    var type$b = utils.type;





    Color_1.prototype.name = function() {
        var hex = rgb2hex_1(this._rgb, 'rgb');
        for (var i = 0, list = Object.keys(w3cx11_1); i < list.length; i += 1) {
            var n = list[i];

            if (w3cx11_1[n] === hex) { return n.toLowerCase(); }
        }
        return hex;
    };

    input.format.named = function (name) {
        name = name.toLowerCase();
        if (w3cx11_1[name]) { return hex2rgb_1(w3cx11_1[name]); }
        throw new Error('unknown color name: '+name);
    };

    input.autodetect.push({
        p: 5,
        test: function (h) {
            var arguments$1 = arguments;

            var rest = [], len = arguments.length - 1;
            while ( len-- > 0 ) { rest[ len ] = arguments$1[ len + 1 ]; }

            if (!rest.length && type$b(h) === 'string' && w3cx11_1[h.toLowerCase()]) {
                return 'named';
            }
        }
    });

    var unpack$t = utils.unpack;

    var rgb2num = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        var ref = unpack$t(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        return (r << 16) + (g << 8) + b;
    };

    var rgb2num_1 = rgb2num;

    var type$c = utils.type;

    var num2rgb = function (num) {
        if (type$c(num) == "number" && num >= 0 && num <= 0xFFFFFF) {
            var r = num >> 16;
            var g = (num >> 8) & 0xFF;
            var b = num & 0xFF;
            return [r,g,b,1];
        }
        throw new Error("unknown num color: "+num);
    };

    var num2rgb_1 = num2rgb;

    var type$d = utils.type;



    Color_1.prototype.num = function() {
        return rgb2num_1(this._rgb);
    };

    chroma_1.num = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['num']) ));
    };

    input.format.num = num2rgb_1;

    input.autodetect.push({
        p: 5,
        test: function () {
            var arguments$1 = arguments;

            var args = [], len = arguments.length;
            while ( len-- ) { args[ len ] = arguments$1[ len ]; }

            if (args.length === 1 && type$d(args[0]) === 'number' && args[0] >= 0 && args[0] <= 0xFFFFFF) {
                return 'num';
            }
        }
    });

    var unpack$u = utils.unpack;
    var type$e = utils.type;
    var round$5 = Math.round;

    Color_1.prototype.rgb = function(rnd) {
        if ( rnd === void 0 ) { rnd=true; }

        if (rnd === false) { return this._rgb.slice(0,3); }
        return this._rgb.slice(0,3).map(round$5);
    };

    Color_1.prototype.rgba = function(rnd) {
        if ( rnd === void 0 ) { rnd=true; }

        return this._rgb.slice(0,4).map(function (v,i) {
            return i<3 ? (rnd === false ? v : round$5(v)) : v;
        });
    };

    chroma_1.rgb = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['rgb']) ));
    };

    input.format.rgb = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        var rgba = unpack$u(args, 'rgba');
        if (rgba[3] === undefined) { rgba[3] = 1; }
        return rgba;
    };

    input.autodetect.push({
        p: 3,
        test: function () {
            var arguments$1 = arguments;

            var args = [], len = arguments.length;
            while ( len-- ) { args[ len ] = arguments$1[ len ]; }

            args = unpack$u(args, 'rgba');
            if (type$e(args) === 'array' && (args.length === 3 ||
                args.length === 4 && type$e(args[3]) == 'number' && args[3] >= 0 && args[3] <= 1)) {
                return 'rgb';
            }
        }
    });

    /*
     * Based on implementation by Neil Bartlett
     * https://github.com/neilbartlett/color-temperature
     */

    var log = Math.log;

    var temperature2rgb = function (kelvin) {
        var temp = kelvin / 100;
        var r,g,b;
        if (temp < 66) {
            r = 255;
            g = -155.25485562709179 - 0.44596950469579133 * (g = temp-2) + 104.49216199393888 * log(g);
            b = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (b = temp-10) + 115.67994401066147 * log(b);
        } else {
            r = 351.97690566805693 + 0.114206453784165 * (r = temp-55) - 40.25366309332127 * log(r);
            g = 325.4494125711974 + 0.07943456536662342 * (g = temp-50) - 28.0852963507957 * log(g);
            b = 255;
        }
        return [r,g,b,1];
    };

    var temperature2rgb_1 = temperature2rgb;

    /*
     * Based on implementation by Neil Bartlett
     * https://github.com/neilbartlett/color-temperature
     **/


    var unpack$v = utils.unpack;
    var round$6 = Math.round;

    var rgb2temperature = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        var rgb = unpack$v(args, 'rgb');
        var r = rgb[0], b = rgb[2];
        var minTemp = 1000;
        var maxTemp = 40000;
        var eps = 0.4;
        var temp;
        while (maxTemp - minTemp > eps) {
            temp = (maxTemp + minTemp) * 0.5;
            var rgb$1 = temperature2rgb_1(temp);
            if ((rgb$1[2] / rgb$1[0]) >= (b / r)) {
                maxTemp = temp;
            } else {
                minTemp = temp;
            }
        }
        return round$6(temp);
    };

    var rgb2temperature_1 = rgb2temperature;

    Color_1.prototype.temp =
    Color_1.prototype.kelvin =
    Color_1.prototype.temperature = function() {
        return rgb2temperature_1(this._rgb);
    };

    chroma_1.temp =
    chroma_1.kelvin =
    chroma_1.temperature = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['temp']) ));
    };

    input.format.temp =
    input.format.kelvin =
    input.format.temperature = temperature2rgb_1;

    var type$f = utils.type;

    Color_1.prototype.alpha = function(a, mutate) {
        if ( mutate === void 0 ) { mutate=false; }

        if (a !== undefined && type$f(a) === 'number') {
            if (mutate) {
                this._rgb[3] = a;
                return this;
            }
            return new Color_1([this._rgb[0], this._rgb[1], this._rgb[2], a], 'rgb');
        }
        return this._rgb[3];
    };

    Color_1.prototype.clipped = function() {
        return this._rgb._clipped || false;
    };

    Color_1.prototype.darken = function(amount) {
    	if ( amount === void 0 ) { amount=1; }

    	var me = this;
    	var lab = me.lab();
    	lab[0] -= labConstants.Kn * amount;
    	return new Color_1(lab, 'lab').alpha(me.alpha(), true);
    };

    Color_1.prototype.brighten = function(amount) {
    	if ( amount === void 0 ) { amount=1; }

    	return this.darken(-amount);
    };

    Color_1.prototype.darker = Color_1.prototype.darken;
    Color_1.prototype.brighter = Color_1.prototype.brighten;

    Color_1.prototype.get = function(mc) {
        var ref = mc.split('.');
        var mode = ref[0];
        var channel = ref[1];
        var src = this[mode]();
        if (channel) {
            var i = mode.indexOf(channel);
            if (i > -1) { return src[i]; }
            throw new Error(("unknown channel " + channel + " in mode " + mode));
        } else {
            return src;
        }
    };

    var type$g = utils.type;
    var pow$2 = Math.pow;

    var EPS = 1e-7;
    var MAX_ITER = 20;

    Color_1.prototype.luminance = function(lum) {
        if (lum !== undefined && type$g(lum) === 'number') {
            if (lum === 0) {
                // return pure black
                return new Color_1([0,0,0,this._rgb[3]], 'rgb');
            }
            if (lum === 1) {
                // return pure white
                return new Color_1([255,255,255,this._rgb[3]], 'rgb');
            }
            // compute new color using...
            var cur_lum = this.luminance();
            var mode = 'rgb';
            var max_iter = MAX_ITER;

            var test = function (low, high) {
                var mid = low.interpolate(high, 0.5, mode);
                var lm = mid.luminance();
                if (Math.abs(lum - lm) < EPS || !max_iter--) {
                    // close enough
                    return mid;
                }
                return lm > lum ? test(low, mid) : test(mid, high);
            };

            var rgb = (cur_lum > lum ? test(new Color_1([0,0,0]), this) : test(this, new Color_1([255,255,255]))).rgb();
            return new Color_1(rgb.concat( [this._rgb[3]]));
        }
        return rgb2luminance.apply(void 0, (this._rgb).slice(0,3));
    };


    var rgb2luminance = function (r,g,b) {
        // relative luminance
        // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
        r = luminance_x(r);
        g = luminance_x(g);
        b = luminance_x(b);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    var luminance_x = function (x) {
        x /= 255;
        return x <= 0.03928 ? x/12.92 : pow$2((x+0.055)/1.055, 2.4);
    };

    var interpolator = {};

    var type$h = utils.type;


    var mix = function (col1, col2, f) {
        var arguments$1 = arguments;

        if ( f === void 0 ) { f=0.5; }
        var rest = [], len = arguments.length - 3;
        while ( len-- > 0 ) { rest[ len ] = arguments$1[ len + 3 ]; }

        var mode = rest[0] || 'lrgb';
        if (!interpolator[mode] && !rest.length) {
            // fall back to the first supported mode
            mode = Object.keys(interpolator)[0];
        }
        if (!interpolator[mode]) {
            throw new Error(("interpolation mode " + mode + " is not defined"));
        }
        if (type$h(col1) !== 'object') { col1 = new Color_1(col1); }
        if (type$h(col2) !== 'object') { col2 = new Color_1(col2); }
        return interpolator[mode](col1, col2, f)
            .alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
    };

    Color_1.prototype.mix =
    Color_1.prototype.interpolate = function(col2, f) {
    	var arguments$1 = arguments;

    	if ( f === void 0 ) { f=0.5; }
    	var rest = [], len = arguments.length - 2;
    	while ( len-- > 0 ) { rest[ len ] = arguments$1[ len + 2 ]; }

    	return mix.apply(void 0, [ this, col2, f ].concat( rest ));
    };

    Color_1.prototype.premultiply = function(mutate) {
    	if ( mutate === void 0 ) { mutate=false; }

    	var rgb = this._rgb;
    	var a = rgb[3];
    	if (mutate) {
    		this._rgb = [rgb[0]*a, rgb[1]*a, rgb[2]*a, a];
    		return this;
    	} else {
    		return new Color_1([rgb[0]*a, rgb[1]*a, rgb[2]*a, a], 'rgb');
    	}
    };

    Color_1.prototype.saturate = function(amount) {
    	if ( amount === void 0 ) { amount=1; }

    	var me = this;
    	var lch = me.lch();
    	lch[1] += labConstants.Kn * amount;
    	if (lch[1] < 0) { lch[1] = 0; }
    	return new Color_1(lch, 'lch').alpha(me.alpha(), true);
    };

    Color_1.prototype.desaturate = function(amount) {
    	if ( amount === void 0 ) { amount=1; }

    	return this.saturate(-amount);
    };

    var type$i = utils.type;

    Color_1.prototype.set = function(mc, value, mutate) {
        if ( mutate === void 0 ) { mutate=false; }

        var ref = mc.split('.');
        var mode = ref[0];
        var channel = ref[1];
        var src = this[mode]();
        if (channel) {
            var i = mode.indexOf(channel);
            if (i > -1) {
                if (type$i(value) == 'string') {
                    switch(value.charAt(0)) {
                        case '+': src[i] += +value; break;
                        case '-': src[i] += +value; break;
                        case '*': src[i] *= +(value.substr(1)); break;
                        case '/': src[i] /= +(value.substr(1)); break;
                        default: src[i] = +value;
                    }
                } else if (type$i(value) === 'number') {
                    src[i] = value;
                } else {
                    throw new Error("unsupported value for Color.set");
                }
                var out = new Color_1(src, mode);
                if (mutate) {
                    this._rgb = out._rgb;
                    return this;
                }
                return out;
            }
            throw new Error(("unknown channel " + channel + " in mode " + mode));
        } else {
            return src;
        }
    };

    var rgb$1 = function (col1, col2, f) {
        var xyz0 = col1._rgb;
        var xyz1 = col2._rgb;
        return new Color_1(
            xyz0[0] + f * (xyz1[0]-xyz0[0]),
            xyz0[1] + f * (xyz1[1]-xyz0[1]),
            xyz0[2] + f * (xyz1[2]-xyz0[2]),
            'rgb'
        )
    };

    // register interpolator
    interpolator.rgb = rgb$1;

    var sqrt$2 = Math.sqrt;
    var pow$3 = Math.pow;

    var lrgb = function (col1, col2, f) {
        var ref = col1._rgb;
        var x1 = ref[0];
        var y1 = ref[1];
        var z1 = ref[2];
        var ref$1 = col2._rgb;
        var x2 = ref$1[0];
        var y2 = ref$1[1];
        var z2 = ref$1[2];
        return new Color_1(
            sqrt$2(pow$3(x1,2) * (1-f) + pow$3(x2,2) * f),
            sqrt$2(pow$3(y1,2) * (1-f) + pow$3(y2,2) * f),
            sqrt$2(pow$3(z1,2) * (1-f) + pow$3(z2,2) * f),
            'rgb'
        )
    };

    // register interpolator
    interpolator.lrgb = lrgb;

    var lab$1 = function (col1, col2, f) {
        var xyz0 = col1.lab();
        var xyz1 = col2.lab();
        return new Color_1(
            xyz0[0] + f * (xyz1[0]-xyz0[0]),
            xyz0[1] + f * (xyz1[1]-xyz0[1]),
            xyz0[2] + f * (xyz1[2]-xyz0[2]),
            'lab'
        )
    };

    // register interpolator
    interpolator.lab = lab$1;

    var _hsx = function (col1, col2, f, m) {
        var assign, assign$1;

        var xyz0, xyz1;
        if (m === 'hsl') {
            xyz0 = col1.hsl();
            xyz1 = col2.hsl();
        } else if (m === 'hsv') {
            xyz0 = col1.hsv();
            xyz1 = col2.hsv();
        } else if (m === 'hcg') {
            xyz0 = col1.hcg();
            xyz1 = col2.hcg();
        } else if (m === 'hsi') {
            xyz0 = col1.hsi();
            xyz1 = col2.hsi();
        } else if (m === 'lch' || m === 'hcl') {
            m = 'hcl';
            xyz0 = col1.hcl();
            xyz1 = col2.hcl();
        }

        var hue0, hue1, sat0, sat1, lbv0, lbv1;
        if (m.substr(0, 1) === 'h') {
            (assign = xyz0, hue0 = assign[0], sat0 = assign[1], lbv0 = assign[2]);
            (assign$1 = xyz1, hue1 = assign$1[0], sat1 = assign$1[1], lbv1 = assign$1[2]);
        }

        var sat, hue, lbv, dh;

        if (!isNaN(hue0) && !isNaN(hue1)) {
            // both colors have hue
            if (hue1 > hue0 && hue1 - hue0 > 180) {
                dh = hue1-(hue0+360);
            } else if (hue1 < hue0 && hue0 - hue1 > 180) {
                dh = hue1+360-hue0;
            } else{
                dh = hue1 - hue0;
            }
            hue = hue0 + f * dh;
        } else if (!isNaN(hue0)) {
            hue = hue0;
            if ((lbv1 == 1 || lbv1 == 0) && m != 'hsv') { sat = sat0; }
        } else if (!isNaN(hue1)) {
            hue = hue1;
            if ((lbv0 == 1 || lbv0 == 0) && m != 'hsv') { sat = sat1; }
        } else {
            hue = Number.NaN;
        }

        if (sat === undefined) { sat = sat0 + f * (sat1 - sat0); }
        lbv = lbv0 + f * (lbv1-lbv0);
        return new Color_1([hue, sat, lbv], m);
    };

    var lch$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'lch');
    };

    // register interpolator
    interpolator.lch = lch$1;
    interpolator.hcl = lch$1;

    var num$1 = function (col1, col2, f) {
        var c1 = col1.num();
        var c2 = col2.num();
        return new Color_1(c1 + f * (c2-c1), 'num')
    };

    // register interpolator
    interpolator.num = num$1;

    var hcg$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'hcg');
    };

    // register interpolator
    interpolator.hcg = hcg$1;

    var hsi$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'hsi');
    };

    // register interpolator
    interpolator.hsi = hsi$1;

    var hsl$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'hsl');
    };

    // register interpolator
    interpolator.hsl = hsl$1;

    var hsv$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'hsv');
    };

    // register interpolator
    interpolator.hsv = hsv$1;

    var clip_rgb$2 = utils.clip_rgb;
    var pow$4 = Math.pow;
    var sqrt$3 = Math.sqrt;
    var PI$1 = Math.PI;
    var cos$2 = Math.cos;
    var sin$1 = Math.sin;
    var atan2$1 = Math.atan2;

    var average = function (colors, mode) {
        if ( mode === void 0 ) { mode='lrgb'; }

        var l = colors.length;
        // convert colors to Color objects
        colors = colors.map(function (c) { return new Color_1(c); });
        if (mode === 'lrgb') {
            return _average_lrgb(colors)
        }
        var first = colors.shift();
        var xyz = first.get(mode);
        var cnt = [];
        var dx = 0;
        var dy = 0;
        // initial color
        for (var i=0; i<xyz.length; i++) {
            xyz[i] = xyz[i] || 0;
            cnt.push(isNaN(xyz[i]) ? 0 : 1);
            if (mode.charAt(i) === 'h' && !isNaN(xyz[i])) {
                var A = xyz[i] / 180 * PI$1;
                dx += cos$2(A);
                dy += sin$1(A);
            }
        }

        var alpha = first.alpha();
        colors.forEach(function (c) {
            var xyz2 = c.get(mode);
            alpha += c.alpha();
            for (var i=0; i<xyz.length; i++) {
                if (!isNaN(xyz2[i])) {
                    cnt[i]++;
                    if (mode.charAt(i) === 'h') {
                        var A = xyz2[i] / 180 * PI$1;
                        dx += cos$2(A);
                        dy += sin$1(A);
                    } else {
                        xyz[i] += xyz2[i];
                    }
                }
            }
        });

        for (var i$1=0; i$1<xyz.length; i$1++) {
            if (mode.charAt(i$1) === 'h') {
                var A$1 = atan2$1(dy / cnt[i$1], dx / cnt[i$1]) / PI$1 * 180;
                while (A$1 < 0) { A$1 += 360; }
                while (A$1 >= 360) { A$1 -= 360; }
                xyz[i$1] = A$1;
            } else {
                xyz[i$1] = xyz[i$1]/cnt[i$1];
            }
        }
        alpha /= l;
        return (new Color_1(xyz, mode)).alpha(alpha > 0.99999 ? 1 : alpha, true);
    };


    var _average_lrgb = function (colors) {
        var l = colors.length;
        var f = 1/l;
        var xyz = [0,0,0,0];
        for (var i = 0, list = colors; i < list.length; i += 1) {
            var col = list[i];

            var rgb = col._rgb;
            xyz[0] += pow$4(rgb[0],2) * f;
            xyz[1] += pow$4(rgb[1],2) * f;
            xyz[2] += pow$4(rgb[2],2) * f;
            xyz[3] += rgb[3] * f;
        }
        xyz[0] = sqrt$3(xyz[0]);
        xyz[1] = sqrt$3(xyz[1]);
        xyz[2] = sqrt$3(xyz[2]);
        if (xyz[3] > 0.9999999) { xyz[3] = 1; }
        return new Color_1(clip_rgb$2(xyz));
    };

    // minimal multi-purpose interface

    // @requires utils color analyze


    var type$j = utils.type;

    var pow$5 = Math.pow;

    var scale = function(colors) {

        // constructor
        var _mode = 'rgb';
        var _nacol = chroma_1('#ccc');
        var _spread = 0;
        // const _fixed = false;
        var _domain = [0, 1];
        var _pos = [];
        var _padding = [0,0];
        var _classes = false;
        var _colors = [];
        var _out = false;
        var _min = 0;
        var _max = 1;
        var _correctLightness = false;
        var _colorCache = {};
        var _useCache = true;
        var _gamma = 1;

        // private methods

        var setColors = function(colors) {
            colors = colors || ['#fff', '#000'];
            if (colors && type$j(colors) === 'string' && chroma_1.brewer &&
                chroma_1.brewer[colors.toLowerCase()]) {
                colors = chroma_1.brewer[colors.toLowerCase()];
            }
            if (type$j(colors) === 'array') {
                // handle single color
                if (colors.length === 1) {
                    colors = [colors[0], colors[0]];
                }
                // make a copy of the colors
                colors = colors.slice(0);
                // convert to chroma classes
                for (var c=0; c<colors.length; c++) {
                    colors[c] = chroma_1(colors[c]);
                }
                // auto-fill color position
                _pos.length = 0;
                for (var c$1=0; c$1<colors.length; c$1++) {
                    _pos.push(c$1/(colors.length-1));
                }
            }
            resetCache();
            return _colors = colors;
        };

        var getClass = function(value) {
            if (_classes != null) {
                var n = _classes.length-1;
                var i = 0;
                while (i < n && value >= _classes[i]) {
                    i++;
                }
                return i-1;
            }
            return 0;
        };

        var tmap = function (t) { return t; };

        // const classifyValue = function(value) {
        //     let val = value;
        //     if (_classes.length > 2) {
        //         const n = _classes.length-1;
        //         const i = getClass(value);
        //         const minc = _classes[0] + ((_classes[1]-_classes[0]) * (0 + (_spread * 0.5)));  // center of 1st class
        //         const maxc = _classes[n-1] + ((_classes[n]-_classes[n-1]) * (1 - (_spread * 0.5)));  // center of last class
        //         val = _min + ((((_classes[i] + ((_classes[i+1] - _classes[i]) * 0.5)) - minc) / (maxc-minc)) * (_max - _min));
        //     }
        //     return val;
        // };

        var getColor = function(val, bypassMap) {
            var col, t;
            if (bypassMap == null) { bypassMap = false; }
            if (isNaN(val) || (val === null)) { return _nacol; }
            if (!bypassMap) {
                if (_classes && (_classes.length > 2)) {
                    // find the class
                    var c = getClass(val);
                    t = c / (_classes.length-2);
                } else if (_max !== _min) {
                    // just interpolate between min/max
                    t = (val - _min) / (_max - _min);
                } else {
                    t = 1;
                }
            } else {
                t = val;
            }

            if (!bypassMap) {
                t = tmap(t);  // lightness correction
            }

            if (_gamma !== 1) { t = pow$5(t, _gamma); }

            t = _padding[0] + (t * (1 - _padding[0] - _padding[1]));

            t = Math.min(1, Math.max(0, t));

            var k = Math.floor(t * 10000);

            if (_useCache && _colorCache[k]) {
                col = _colorCache[k];
            } else {
                if (type$j(_colors) === 'array') {
                    //for i in [0.._pos.length-1]
                    for (var i=0; i<_pos.length; i++) {
                        var p = _pos[i];
                        if (t <= p) {
                            col = _colors[i];
                            break;
                        }
                        if ((t >= p) && (i === (_pos.length-1))) {
                            col = _colors[i];
                            break;
                        }
                        if (t > p && t < _pos[i+1]) {
                            t = (t-p)/(_pos[i+1]-p);
                            col = chroma_1.interpolate(_colors[i], _colors[i+1], t, _mode);
                            break;
                        }
                    }
                } else if (type$j(_colors) === 'function') {
                    col = _colors(t);
                }
                if (_useCache) { _colorCache[k] = col; }
            }
            return col;
        };

        var resetCache = function () { return _colorCache = {}; };

        setColors(colors);

        // public interface

        var f = function(v) {
            var c = chroma_1(getColor(v));
            if (_out && c[_out]) { return c[_out](); } else { return c; }
        };

        f.classes = function(classes) {
            if (classes != null) {
                if (type$j(classes) === 'array') {
                    _classes = classes;
                    _domain = [classes[0], classes[classes.length-1]];
                } else {
                    var d = chroma_1.analyze(_domain);
                    if (classes === 0) {
                        _classes = [d.min, d.max];
                    } else {
                        _classes = chroma_1.limits(d, 'e', classes);
                    }
                }
                return f;
            }
            return _classes;
        };


        f.domain = function(domain) {
            if (!arguments.length) {
                return _domain;
            }
            _min = domain[0];
            _max = domain[domain.length-1];
            _pos = [];
            var k = _colors.length;
            if ((domain.length === k) && (_min !== _max)) {
                // update positions
                for (var i = 0, list = Array.from(domain); i < list.length; i += 1) {
                    var d = list[i];

                  _pos.push((d-_min) / (_max-_min));
                }
            } else {
                for (var c=0; c<k; c++) {
                    _pos.push(c/(k-1));
                }
            }
            _domain = [_min, _max];
            return f;
        };

        f.mode = function(_m) {
            if (!arguments.length) {
                return _mode;
            }
            _mode = _m;
            resetCache();
            return f;
        };

        f.range = function(colors, _pos) {
            setColors(colors, _pos);
            return f;
        };

        f.out = function(_o) {
            _out = _o;
            return f;
        };

        f.spread = function(val) {
            if (!arguments.length) {
                return _spread;
            }
            _spread = val;
            return f;
        };

        f.correctLightness = function(v) {
            if (v == null) { v = true; }
            _correctLightness = v;
            resetCache();
            if (_correctLightness) {
                tmap = function(t) {
                    var L0 = getColor(0, true).lab()[0];
                    var L1 = getColor(1, true).lab()[0];
                    var pol = L0 > L1;
                    var L_actual = getColor(t, true).lab()[0];
                    var L_ideal = L0 + ((L1 - L0) * t);
                    var L_diff = L_actual - L_ideal;
                    var t0 = 0;
                    var t1 = 1;
                    var max_iter = 20;
                    while ((Math.abs(L_diff) > 1e-2) && (max_iter-- > 0)) {
                        (function() {
                            if (pol) { L_diff *= -1; }
                            if (L_diff < 0) {
                                t0 = t;
                                t += (t1 - t) * 0.5;
                            } else {
                                t1 = t;
                                t += (t0 - t) * 0.5;
                            }
                            L_actual = getColor(t, true).lab()[0];
                            return L_diff = L_actual - L_ideal;
                        })();
                    }
                    return t;
                };
            } else {
                tmap = function (t) { return t; };
            }
            return f;
        };

        f.padding = function(p) {
            if (p != null) {
                if (type$j(p) === 'number') {
                    p = [p,p];
                }
                _padding = p;
                return f;
            } else {
                return _padding;
            }
        };

        f.colors = function(numColors, out) {
            // If no arguments are given, return the original colors that were provided
            if (arguments.length < 2) { out = 'hex'; }
            var result = [];

            if (arguments.length === 0) {
                result = _colors.slice(0);

            } else if (numColors === 1) {
                result = [f(0.5)];

            } else if (numColors > 1) {
                var dm = _domain[0];
                var dd = _domain[1] - dm;
                result = __range__(0, numColors, false).map(function (i) { return f( dm + ((i/(numColors-1)) * dd) ); });

            } else { // returns all colors based on the defined classes
                colors = [];
                var samples = [];
                if (_classes && (_classes.length > 2)) {
                    for (var i = 1, end = _classes.length, asc = 1 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
                        samples.push((_classes[i-1]+_classes[i])*0.5);
                    }
                } else {
                    samples = _domain;
                }
                result = samples.map(function (v) { return f(v); });
            }

            if (chroma_1[out]) {
                result = result.map(function (c) { return c[out](); });
            }
            return result;
        };

        f.cache = function(c) {
            if (c != null) {
                _useCache = c;
                return f;
            } else {
                return _useCache;
            }
        };

        f.gamma = function(g) {
            if (g != null) {
                _gamma = g;
                return f;
            } else {
                return _gamma;
            }
        };

        f.nodata = function(d) {
            if (d != null) {
                _nacol = chroma_1(d);
                return f;
            } else {
                return _nacol;
            }
        };

        return f;
    };

    function __range__(left, right, inclusive) {
      var range = [];
      var ascending = left < right;
      var end = !inclusive ? right : ascending ? right + 1 : right - 1;
      for (var i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
        range.push(i);
      }
      return range;
    }

    //
    // interpolates between a set of colors uzing a bezier spline
    //

    // @requires utils lab




    var bezier = function(colors) {
        var assign, assign$1, assign$2;

        var I, lab0, lab1, lab2;
        colors = colors.map(function (c) { return new Color_1(c); });
        if (colors.length === 2) {
            // linear interpolation
            (assign = colors.map(function (c) { return c.lab(); }), lab0 = assign[0], lab1 = assign[1]);
            I = function(t) {
                var lab = ([0, 1, 2].map(function (i) { return lab0[i] + (t * (lab1[i] - lab0[i])); }));
                return new Color_1(lab, 'lab');
            };
        } else if (colors.length === 3) {
            // quadratic bezier interpolation
            (assign$1 = colors.map(function (c) { return c.lab(); }), lab0 = assign$1[0], lab1 = assign$1[1], lab2 = assign$1[2]);
            I = function(t) {
                var lab = ([0, 1, 2].map(function (i) { return ((1-t)*(1-t) * lab0[i]) + (2 * (1-t) * t * lab1[i]) + (t * t * lab2[i]); }));
                return new Color_1(lab, 'lab');
            };
        } else if (colors.length === 4) {
            // cubic bezier interpolation
            var lab3;
            (assign$2 = colors.map(function (c) { return c.lab(); }), lab0 = assign$2[0], lab1 = assign$2[1], lab2 = assign$2[2], lab3 = assign$2[3]);
            I = function(t) {
                var lab = ([0, 1, 2].map(function (i) { return ((1-t)*(1-t)*(1-t) * lab0[i]) + (3 * (1-t) * (1-t) * t * lab1[i]) + (3 * (1-t) * t * t * lab2[i]) + (t*t*t * lab3[i]); }));
                return new Color_1(lab, 'lab');
            };
        } else if (colors.length === 5) {
            var I0 = bezier(colors.slice(0, 3));
            var I1 = bezier(colors.slice(2, 5));
            I = function(t) {
                if (t < 0.5) {
                    return I0(t*2);
                } else {
                    return I1((t-0.5)*2);
                }
            };
        }
        return I;
    };

    var bezier_1 = function (colors) {
        var f = bezier(colors);
        f.scale = function () { return scale(f); };
        return f;
    };

    /*
     * interpolates between a set of colors uzing a bezier spline
     * blend mode formulas taken from http://www.venture-ware.com/kevin/coding/lets-learn-math-photoshop-blend-modes/
     */




    var blend = function (bottom, top, mode) {
        if (!blend[mode]) {
            throw new Error('unknown blend mode ' + mode);
        }
        return blend[mode](bottom, top);
    };

    var blend_f = function (f) { return function (bottom,top) {
            var c0 = chroma_1(top).rgb();
            var c1 = chroma_1(bottom).rgb();
            return chroma_1.rgb(f(c0, c1));
        }; };

    var each = function (f) { return function (c0, c1) {
            var out = [];
            out[0] = f(c0[0], c1[0]);
            out[1] = f(c0[1], c1[1]);
            out[2] = f(c0[2], c1[2]);
            return out;
        }; };

    var normal = function (a) { return a; };
    var multiply = function (a,b) { return a * b / 255; };
    var darken$1 = function (a,b) { return a > b ? b : a; };
    var lighten = function (a,b) { return a > b ? a : b; };
    var screen = function (a,b) { return 255 * (1 - (1-a/255) * (1-b/255)); };
    var overlay = function (a,b) { return b < 128 ? 2 * a * b / 255 : 255 * (1 - 2 * (1 - a / 255 ) * ( 1 - b / 255 )); };
    var burn = function (a,b) { return 255 * (1 - (1 - b / 255) / (a/255)); };
    var dodge = function (a,b) {
        if (a === 255) { return 255; }
        a = 255 * (b / 255) / (1 - a / 255);
        return a > 255 ? 255 : a
    };

    // # add = (a,b) ->
    // #     if (a + b > 255) then 255 else a + b

    blend.normal = blend_f(each(normal));
    blend.multiply = blend_f(each(multiply));
    blend.screen = blend_f(each(screen));
    blend.overlay = blend_f(each(overlay));
    blend.darken = blend_f(each(darken$1));
    blend.lighten = blend_f(each(lighten));
    blend.dodge = blend_f(each(dodge));
    blend.burn = blend_f(each(burn));
    // blend.add = blend_f(each(add));

    var blend_1 = blend;

    // cubehelix interpolation
    // based on D.A. Green "A colour scheme for the display of astronomical intensity images"
    // http://astron-soc.in/bulletin/11June/289392011.pdf

    var type$k = utils.type;
    var clip_rgb$3 = utils.clip_rgb;
    var TWOPI$2 = utils.TWOPI;
    var pow$6 = Math.pow;
    var sin$2 = Math.sin;
    var cos$3 = Math.cos;


    var cubehelix = function(start, rotations, hue, gamma, lightness) {
        if ( start === void 0 ) { start=300; }
        if ( rotations === void 0 ) { rotations=-1.5; }
        if ( hue === void 0 ) { hue=1; }
        if ( gamma === void 0 ) { gamma=1; }
        if ( lightness === void 0 ) { lightness=[0,1]; }

        var dh = 0, dl;
        if (type$k(lightness) === 'array') {
            dl = lightness[1] - lightness[0];
        } else {
            dl = 0;
            lightness = [lightness, lightness];
        }

        var f = function(fract) {
            var a = TWOPI$2 * (((start+120)/360) + (rotations * fract));
            var l = pow$6(lightness[0] + (dl * fract), gamma);
            var h = dh !== 0 ? hue[0] + (fract * dh) : hue;
            var amp = (h * l * (1-l)) / 2;
            var cos_a = cos$3(a);
            var sin_a = sin$2(a);
            var r = l + (amp * ((-0.14861 * cos_a) + (1.78277* sin_a)));
            var g = l + (amp * ((-0.29227 * cos_a) - (0.90649* sin_a)));
            var b = l + (amp * (+1.97294 * cos_a));
            return chroma_1(clip_rgb$3([r*255,g*255,b*255,1]));
        };

        f.start = function(s) {
            if ((s == null)) { return start; }
            start = s;
            return f;
        };

        f.rotations = function(r) {
            if ((r == null)) { return rotations; }
            rotations = r;
            return f;
        };

        f.gamma = function(g) {
            if ((g == null)) { return gamma; }
            gamma = g;
            return f;
        };

        f.hue = function(h) {
            if ((h == null)) { return hue; }
            hue = h;
            if (type$k(hue) === 'array') {
                dh = hue[1] - hue[0];
                if (dh === 0) { hue = hue[1]; }
            } else {
                dh = 0;
            }
            return f;
        };

        f.lightness = function(h) {
            if ((h == null)) { return lightness; }
            if (type$k(h) === 'array') {
                lightness = h;
                dl = h[1] - h[0];
            } else {
                lightness = [h,h];
                dl = 0;
            }
            return f;
        };

        f.scale = function () { return chroma_1.scale(f); };

        f.hue(hue);

        return f;
    };

    var digits = '0123456789abcdef';

    var floor$2 = Math.floor;
    var random = Math.random;

    var random_1 = function () {
        var code = '#';
        for (var i=0; i<6; i++) {
            code += digits.charAt(floor$2(random() * 16));
        }
        return new Color_1(code, 'hex');
    };

    var log$1 = Math.log;
    var pow$7 = Math.pow;
    var floor$3 = Math.floor;
    var abs = Math.abs;


    var analyze = function (data, key) {
        if ( key === void 0 ) { key=null; }

        var r = {
            min: Number.MAX_VALUE,
            max: Number.MAX_VALUE*-1,
            sum: 0,
            values: [],
            count: 0
        };
        if (type(data) === 'object') {
            data = Object.values(data);
        }
        data.forEach(function (val) {
            if (key && type(val) === 'object') { val = val[key]; }
            if (val !== undefined && val !== null && !isNaN(val)) {
                r.values.push(val);
                r.sum += val;
                if (val < r.min) { r.min = val; }
                if (val > r.max) { r.max = val; }
                r.count += 1;
            }
        });

        r.domain = [r.min, r.max];

        r.limits = function (mode, num) { return limits(r, mode, num); };

        return r;
    };


    var limits = function (data, mode, num) {
        if ( mode === void 0 ) { mode='equal'; }
        if ( num === void 0 ) { num=7; }

        if (type(data) == 'array') {
            data = analyze(data);
        }
        var min = data.min;
        var max = data.max;
        var values = data.values.sort(function (a,b) { return a-b; });

        if (num === 1) { return [min,max]; }

        var limits = [];

        if (mode.substr(0,1) === 'c') { // continuous
            limits.push(min);
            limits.push(max);
        }

        if (mode.substr(0,1) === 'e') { // equal interval
            limits.push(min);
            for (var i=1; i<num; i++) {
                limits.push(min+((i/num)*(max-min)));
            }
            limits.push(max);
        }

        else if (mode.substr(0,1) === 'l') { // log scale
            if (min <= 0) {
                throw new Error('Logarithmic scales are only possible for values > 0');
            }
            var min_log = Math.LOG10E * log$1(min);
            var max_log = Math.LOG10E * log$1(max);
            limits.push(min);
            for (var i$1=1; i$1<num; i$1++) {
                limits.push(pow$7(10, min_log + ((i$1/num) * (max_log - min_log))));
            }
            limits.push(max);
        }

        else if (mode.substr(0,1) === 'q') { // quantile scale
            limits.push(min);
            for (var i$2=1; i$2<num; i$2++) {
                var p = ((values.length-1) * i$2)/num;
                var pb = floor$3(p);
                if (pb === p) {
                    limits.push(values[pb]);
                } else { // p > pb
                    var pr = p - pb;
                    limits.push((values[pb]*(1-pr)) + (values[pb+1]*pr));
                }
            }
            limits.push(max);

        }

        else if (mode.substr(0,1) === 'k') { // k-means clustering
            /*
            implementation based on
            http://code.google.com/p/figue/source/browse/trunk/figue.js#336
            simplified for 1-d input values
            */
            var cluster;
            var n = values.length;
            var assignments = new Array(n);
            var clusterSizes = new Array(num);
            var repeat = true;
            var nb_iters = 0;
            var centroids = null;

            // get seed values
            centroids = [];
            centroids.push(min);
            for (var i$3=1; i$3<num; i$3++) {
                centroids.push(min + ((i$3/num) * (max-min)));
            }
            centroids.push(max);

            while (repeat) {
                // assignment step
                for (var j=0; j<num; j++) {
                    clusterSizes[j] = 0;
                }
                for (var i$4=0; i$4<n; i$4++) {
                    var value = values[i$4];
                    var mindist = Number.MAX_VALUE;
                    var best = (void 0);
                    for (var j$1=0; j$1<num; j$1++) {
                        var dist = abs(centroids[j$1]-value);
                        if (dist < mindist) {
                            mindist = dist;
                            best = j$1;
                        }
                        clusterSizes[best]++;
                        assignments[i$4] = best;
                    }
                }

                // update centroids step
                var newCentroids = new Array(num);
                for (var j$2=0; j$2<num; j$2++) {
                    newCentroids[j$2] = null;
                }
                for (var i$5=0; i$5<n; i$5++) {
                    cluster = assignments[i$5];
                    if (newCentroids[cluster] === null) {
                        newCentroids[cluster] = values[i$5];
                    } else {
                        newCentroids[cluster] += values[i$5];
                    }
                }
                for (var j$3=0; j$3<num; j$3++) {
                    newCentroids[j$3] *= 1/clusterSizes[j$3];
                }

                // check convergence
                repeat = false;
                for (var j$4=0; j$4<num; j$4++) {
                    if (newCentroids[j$4] !== centroids[j$4]) {
                        repeat = true;
                        break;
                    }
                }

                centroids = newCentroids;
                nb_iters++;

                if (nb_iters > 200) {
                    repeat = false;
                }
            }

            // finished k-means clustering
            // the next part is borrowed from gabrielflor.it
            var kClusters = {};
            for (var j$5=0; j$5<num; j$5++) {
                kClusters[j$5] = [];
            }
            for (var i$6=0; i$6<n; i$6++) {
                cluster = assignments[i$6];
                kClusters[cluster].push(values[i$6]);
            }
            var tmpKMeansBreaks = [];
            for (var j$6=0; j$6<num; j$6++) {
                tmpKMeansBreaks.push(kClusters[j$6][0]);
                tmpKMeansBreaks.push(kClusters[j$6][kClusters[j$6].length-1]);
            }
            tmpKMeansBreaks = tmpKMeansBreaks.sort(function (a,b){ return a-b; });
            limits.push(tmpKMeansBreaks[0]);
            for (var i$7=1; i$7 < tmpKMeansBreaks.length; i$7+= 2) {
                var v = tmpKMeansBreaks[i$7];
                if (!isNaN(v) && (limits.indexOf(v) === -1)) {
                    limits.push(v);
                }
            }
        }
        return limits;
    };

    var analyze_1 = {analyze: analyze, limits: limits};

    var contrast = function (a, b) {
        // WCAG contrast ratio
        // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
        a = new Color_1(a);
        b = new Color_1(b);
        var l1 = a.luminance();
        var l2 = b.luminance();
        return l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
    };

    var sqrt$4 = Math.sqrt;
    var atan2$2 = Math.atan2;
    var abs$1 = Math.abs;
    var cos$4 = Math.cos;
    var PI$2 = Math.PI;

    var deltaE = function(a, b, L, C) {
        if ( L === void 0 ) { L=1; }
        if ( C === void 0 ) { C=1; }

        // Delta E (CMC)
        // see http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CMC.html
        a = new Color_1(a);
        b = new Color_1(b);
        var ref = Array.from(a.lab());
        var L1 = ref[0];
        var a1 = ref[1];
        var b1 = ref[2];
        var ref$1 = Array.from(b.lab());
        var L2 = ref$1[0];
        var a2 = ref$1[1];
        var b2 = ref$1[2];
        var c1 = sqrt$4((a1 * a1) + (b1 * b1));
        var c2 = sqrt$4((a2 * a2) + (b2 * b2));
        var sl = L1 < 16.0 ? 0.511 : (0.040975 * L1) / (1.0 + (0.01765 * L1));
        var sc = ((0.0638 * c1) / (1.0 + (0.0131 * c1))) + 0.638;
        var h1 = c1 < 0.000001 ? 0.0 : (atan2$2(b1, a1) * 180.0) / PI$2;
        while (h1 < 0) { h1 += 360; }
        while (h1 >= 360) { h1 -= 360; }
        var t = (h1 >= 164.0) && (h1 <= 345.0) ? (0.56 + abs$1(0.2 * cos$4((PI$2 * (h1 + 168.0)) / 180.0))) : (0.36 + abs$1(0.4 * cos$4((PI$2 * (h1 + 35.0)) / 180.0)));
        var c4 = c1 * c1 * c1 * c1;
        var f = sqrt$4(c4 / (c4 + 1900.0));
        var sh = sc * (((f * t) + 1.0) - f);
        var delL = L1 - L2;
        var delC = c1 - c2;
        var delA = a1 - a2;
        var delB = b1 - b2;
        var dH2 = ((delA * delA) + (delB * delB)) - (delC * delC);
        var v1 = delL / (L * sl);
        var v2 = delC / (C * sc);
        var v3 = sh;
        return sqrt$4((v1 * v1) + (v2 * v2) + (dH2 / (v3 * v3)));
    };

    // simple Euclidean distance
    var distance = function(a, b, mode) {
        if ( mode === void 0 ) { mode='lab'; }

        // Delta E (CIE 1976)
        // see http://www.brucelindbloom.com/index.html?Equations.html
        a = new Color_1(a);
        b = new Color_1(b);
        var l1 = a.get(mode);
        var l2 = b.get(mode);
        var sum_sq = 0;
        for (var i in l1) {
            var d = (l1[i] || 0) - (l2[i] || 0);
            sum_sq += d*d;
        }
        return Math.sqrt(sum_sq);
    };

    var valid = function () {
        var arguments$1 = arguments;

        var args = [], len = arguments.length;
        while ( len-- ) { args[ len ] = arguments$1[ len ]; }

        try {
            new (Function.prototype.bind.apply( Color_1, [ null ].concat( args) ));
            return true;
        } catch (e) {
            return false;
        }
    };

    // some pre-defined color scales:




    var scales = {
    	cool: function cool() { return scale([chroma_1.hsl(180,1,.9), chroma_1.hsl(250,.7,.4)]) },
    	hot: function hot() { return scale(['#000','#f00','#ff0','#fff'], [0,.25,.75,1]).mode('rgb') }
    };

    /**
        ColorBrewer colors for chroma.js

        Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The
        Pennsylvania State University.

        Licensed under the Apache License, Version 2.0 (the "License");
        you may not use this file except in compliance with the License.
        You may obtain a copy of the License at
        http://www.apache.org/licenses/LICENSE-2.0

        Unless required by applicable law or agreed to in writing, software distributed
        under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
        CONDITIONS OF ANY KIND, either express or implied. See the License for the
        specific language governing permissions and limitations under the License.
    */

    var colorbrewer = {
        // sequential
        OrRd: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
        PuBu: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
        BuPu: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],
        Oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
        BuGn: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
        YlOrBr: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
        YlGn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
        Reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
        RdPu: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
        Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
        YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
        Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
        GnBu: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
        Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
        YlOrRd: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
        PuRd: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
        Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
        PuBuGn: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],
        Viridis: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'],

        // diverging

        Spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
        RdYlGn: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
        RdBu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
        PiYG: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
        PRGn: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
        RdYlBu: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
        BrBG: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
        RdGy: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
        PuOr: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],

        // qualitative

        Set2: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
        Accent: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
        Set1: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
        Set3: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'],
        Dark2: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
        Paired: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'],
        Pastel2: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],
        Pastel1: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2'],
    };

    // add lowercase aliases for case-insensitive matches
    for (var i$1 = 0, list$1 = Object.keys(colorbrewer); i$1 < list$1.length; i$1 += 1) {
        var key = list$1[i$1];

        colorbrewer[key.toLowerCase()] = colorbrewer[key];
    }

    var colorbrewer_1 = colorbrewer;

    // feel free to comment out anything to rollup
    // a smaller chroma.js built

    // io --> convert colors















    // operators --> modify existing Colors










    // interpolators










    // generators -- > create new colors
    chroma_1.average = average;
    chroma_1.bezier = bezier_1;
    chroma_1.blend = blend_1;
    chroma_1.cubehelix = cubehelix;
    chroma_1.mix = chroma_1.interpolate = mix;
    chroma_1.random = random_1;
    chroma_1.scale = scale;

    // other utility methods
    chroma_1.analyze = analyze_1.analyze;
    chroma_1.contrast = contrast;
    chroma_1.deltaE = deltaE;
    chroma_1.distance = distance;
    chroma_1.limits = analyze_1.limits;
    chroma_1.valid = valid;

    // scale
    chroma_1.scales = scales;

    // colors
    chroma_1.colors = w3cx11_1;
    chroma_1.brewer = colorbrewer_1;

    var chroma_js = chroma_1;

    return chroma_js;

})));
});

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
  if ('object' != 'undefined' && !exports.nodeType) {
    if ('object' != 'undefined' && !module.nodeType && module.exports) {
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
  if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
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

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof undefined == 'function' && undefined.amd) {
    undefined('underscore', [], function() {
      return _;
    });
  }
}());
});
var underscore_1 = underscore._;

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/ColorPicker.html generated by Svelte v1.64.0 */

var noColor = '#00000000';

function palette(ref) {
    var $themeData = ref.$themeData;
    var prepend = ref.prepend;
    var append = ref.append;

    return underscore.uniq(prepend.concat($themeData.colors.palette).concat(append));
}
function validColor(ref) {
    var color_ = ref.color_;

    try {
        return chroma(color_).hex();
    } catch (e) {
        return '#000000';
    }
}
function gradient_l(ref) {
    var color_ = ref.color_;

    var lch = chroma(color_).lch();
    var sample = spread(70, 55, 7, 6).map(function (l) { return chroma.lch(l, lch[1], lch[2]).hex(); });
    return chroma
        .scale(['#000000'].concat(sample).concat('#ffffff'))
        .mode('lch')
        .gamma(0.8)
        .padding(0.1)
        .colors(14);
}
function gradient_c(ref) {
    var color_ = ref.color_;
    var palette = ref.palette;

    var high = chroma(color_).set('lch.c', 120);
    if (isNaN(high.get('lch.h'))) {
        high = chroma.lch(high.get('lch.l'), 50, chroma(palette[0] || '#d00').get('lch.h'));
    }
    var low = chroma(color_).set('lch.c', 3);
    return chroma
        .scale([low, high])
        .mode('lch')
        .gamma(1.2)
        .colors(14);
}
function gradient_h(ref) {
    var color_ = ref.color_;

    var lch = chroma(color_).lch();
    var sample = spread(lch[2], 75, 7, 6).map(function (h) { return chroma.lch(lch[0], lch[1], h).hex(); });
    return chroma
        .scale(sample)
        .mode('lch')
        .colors(14);
}
function nearest_l(ref) {
    var color_ = ref.color_;
    var gradient_l = ref.gradient_l;

    return findNearest(gradient_l, color_);
}
function nearest_c(ref) {
    var color_ = ref.color_;
    var gradient_c = ref.gradient_c;

    return findNearest(gradient_c, color_);
}
function nearest_h(ref) {
    var color_ = ref.color_;
    var gradient_h = ref.gradient_h;

    return findNearest(gradient_h, color_);
}
function textColor(ref) {
    var color_ = ref.color_;

    return color_ === noColor ? '#fff' : chroma(color_).get('lab.l') > 60 ? 'black' : 'white';
}
function data$4() {
    return {
        reset: false,
        initial: false,
        palette: [],
        prepend: [],
        append: [],
        // the public color
        color: false,
        // the internal color
        color_: noColor,
        open: false
    };
}
function borderColor(c) {
    return c === noColor
        ? '#ddd'
        : chroma(c)
              .darker()
              .alpha(1)
              .hex();
}
function borderColor2(c) {
    return chroma(c).hex('rgb') === '#ffffff' ? '#eeeeee' : c;
}
function alpha(c) {
    return chroma(c).alpha();
}
var methods$3 = {
    setColor: function setColor(color, close) {
        this.set({ color: color });
        if (close) {
            this.refs.dropdown.set({ visible: false });
        }
    },
    resetColor: function resetColor() {
        var ref = this.get();
        var initial = ref.initial;
        this.set({ color_: noColor });
        this.fire('change', initial);
        this.setColor(initial, true);
    }
};

function onupdate$1(ref) {
    var this$1 = this;
    var changed = ref.changed;
    var current = ref.current;
    var previous = ref.previous;

    if (changed.color_ && previous) {
        try {
            var niceHex = chroma(current.color_).hex();
            this.set({ color: current.color_ });
            // update external color
            if (current.open && niceHex !== previous.color_) {
                this.fire('change', current.validColor);
            }
            if (current.validColor !== current.color_) {
                setTimeout(function () {
                    this$1.set({ color_: current.validColor });
                }, 100);
            }
        } catch (e) {}
    }
    // update internal color if external color changes
    if (changed.color && current.color !== noColor && !previous) {
        this.set({ color_: current.color || noColor });
    } else if (changed.color && current.color && previous) {
        if (current.open) {
            this.fire('change', current.color);
        }
        this.set({ color_: current.color });
    }
}
function findNearest(colors, color) {
    var nearestIndex = -1;
    var nearestDistance = 999999;
    if (colors[0] === colors[1]) { return '-'; }
    colors.forEach(function (c, i) {
        var dist = chroma.distance(c, color, 'lab');
        if (dist < nearestDistance) {
            nearestDistance = dist;
            nearestIndex = i;
        }
    });
    return colors[nearestIndex];
}

function spread(center, width, num, num2, exp) {
    var r = [center];
    var s = width / num;
    var a = 0;
    num2 = underscore.isUndefined(num2) ? num : num2;
    exp = exp || 1;
    while (num-- > 0) {
        a += s;
        r.unshift(center - a);
        if (num2-- > 0) { r.push(center + a); }
    }
    return r;
}

function create_main_fragment$4(component, state) {
	var div, text, span, slot_content_default = component._slotted.default, div_1, div_2, div_3, text_2, span_1, text_6, span_2, text_8, basedropdown_updating = {};

	var if_block = (state.color_) && create_if_block$3(component, state);

	var basedropdown_initial_data = {};
	if ('open' in state) {
		basedropdown_initial_data.visible = state.open;
		basedropdown_updating.visible = true;
	}
	var basedropdown = new BaseDropdown({
		root: component.root,
		slots: { default: createFragment(), button: createFragment(), content: createFragment() },
		data: basedropdown_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!basedropdown_updating.visible && changed.visible) {
				newState.open = childState.visible;
			}
			component._set(newState);
			basedropdown_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		basedropdown._bind({ visible: 1 }, basedropdown.get());
	});

	component.refs.dropdown = basedropdown;

	return {
		c: function create() {
			div = createElement("div");
			text = createText("\n        ");
			span = createElement("span");
			if (!slot_content_default) {
				div_1 = createElement("div");
				div_2 = createElement("div");
				div_3 = createElement("div");
				text_2 = createText("\n                    ");
				span_1 = createElement("span");
			}
			text_6 = createText("\n        ");
			span_2 = createElement("span");
			if (if_block) { if_block.c(); }
			text_8 = createText("\n    ");
			basedropdown._fragment.c();
			this.h();
		},

		h: function hydrate() {
			if (!slot_content_default) {
				div_3.className = "transparency svelte-53boxl";
				setStyle(div_3, "opacity", ( 1-alpha(state.validColor) ));
				setStyle(div_2, "background", "" + state.validColor + " none repeat scroll 0% 0%");
				div_2.className = "the-color svelte-53boxl";
				span_1.className = "caret svelte-53boxl";
				div_1.className = "base-color-picker color-picker svelte-53boxl";
			}
			setAttribute(span, "slot", "button");
			setAttribute(span_2, "slot", "content");
			div.className = "color-picker-cont svelte-53boxl";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(text, basedropdown._slotted.default);
			appendNode(span, basedropdown._slotted.button);
			if (!slot_content_default) {
				appendNode(div_1, span);
				appendNode(div_2, div_1);
				appendNode(div_3, div_2);
				appendNode(text_2, div_1);
				appendNode(span_1, div_1);
			}

			else {
				appendNode(slot_content_default, span);
			}

			appendNode(text_6, basedropdown._slotted.default);
			appendNode(span_2, basedropdown._slotted.content);
			if (if_block) { if_block.m(span_2, null); }
			appendNode(text_8, basedropdown._slotted.default);
			basedropdown._mount(div, null);
		},

		p: function update(changed, state) {
			if (!slot_content_default) {
				if (changed.validColor) {
					setStyle(div_3, "opacity", ( 1-alpha(state.validColor) ));
					setStyle(div_2, "background", "" + state.validColor + " none repeat scroll 0% 0%");
			}

			}

			if (state.color_) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$3(component, state);
					if_block.c();
					if_block.m(span_2, null);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			var basedropdown_changes = {};
			if (!basedropdown_updating.visible && changed.open) {
				basedropdown_changes.visible = state.open;
				basedropdown_updating.visible = true;
			}
			basedropdown._set(basedropdown_changes);
			basedropdown_updating = {};
		},

		u: function unmount() {
			detachNode(div);

			if (slot_content_default) {
				reinsertChildren(span, slot_content_default);
			}

			if (if_block) { if_block.u(); }
		},

		d: function destroy$$1() {
			if (if_block) { if_block.d(); }
			basedropdown.destroy(false);
			if (component.refs.dropdown === basedropdown) { component.refs.dropdown = null; }
		}
	};
}

// (17:20) {#each palette as c}
function create_each_block(component, state) {
	var c = state.c, each_value = state.each_value, c_index = state.c_index;
	var div, div_1, div_data_color_value;

	return {
		c: function create() {
			div = createElement("div");
			div_1 = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div_1.className = "transparency svelte-53boxl";
			setStyle(div_1, "opacity", ( 1-alpha(c) ));
			addListener(div, "click", click_handler);
			addListener(div, "dblclick", dblclick_handler);
			div.className = "color svelte-53boxl";
			setAttribute(div, "class:selected", "c === color_");
			div.dataset.color = div_data_color_value = c;
			setStyle(div, "background", c);
			setStyle(div, "border-color", borderColor2(c));

			div._svelte = {
				component: component,
				each_value: state.each_value,
				c_index: state.c_index
			};
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(div_1, div);
		},

		p: function update(changed, state) {
			c = state.c;
			each_value = state.each_value;
			c_index = state.c_index;
			if (changed.palette) {
				setStyle(div_1, "opacity", ( 1-alpha(c) ));
			}

			if ((changed.palette) && div_data_color_value !== (div_data_color_value = c)) {
				div.dataset.color = div_data_color_value;
			}

			if (changed.palette) {
				setStyle(div, "background", c);
				setStyle(div, "border-color", borderColor2(c));
			}

			div._svelte.each_value = state.each_value;
			div._svelte.c_index = state.c_index;
		},

		u: function unmount() {
			detachNode(div);
		},

		d: function destroy$$1() {
			removeListener(div, "click", click_handler);
			removeListener(div, "dblclick", dblclick_handler);
		}
	};
}

// (32:20) {#each gradient_l as c}
function create_each_block_1(component, state) {
	var c = state.c, each_value_1 = state.each_value_1, c_index_1 = state.c_index_1;
	var div, div_class_value, div_data_color_value;

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			addListener(div, "click", click_handler_1);
			div.className = div_class_value = "color " + (c == state.nearest_l?'selected':'') + " svelte-53boxl";
			div.dataset.color = div_data_color_value = c;
			setStyle(div, "background", c);

			div._svelte = {
				component: component,
				each_value_1: state.each_value_1,
				c_index_1: state.c_index_1
			};
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
		},

		p: function update(changed, state) {
			c = state.c;
			each_value_1 = state.each_value_1;
			c_index_1 = state.c_index_1;
			if ((changed.gradient_l || changed.nearest_l) && div_class_value !== (div_class_value = "color " + (c == state.nearest_l?'selected':'') + " svelte-53boxl")) {
				div.className = div_class_value;
			}

			if ((changed.gradient_l) && div_data_color_value !== (div_data_color_value = c)) {
				div.dataset.color = div_data_color_value;
			}

			if (changed.gradient_l) {
				setStyle(div, "background", c);
			}

			div._svelte.each_value_1 = state.each_value_1;
			div._svelte.c_index_1 = state.c_index_1;
		},

		u: function unmount() {
			detachNode(div);
		},

		d: function destroy$$1() {
			removeListener(div, "click", click_handler_1);
		}
	};
}

// (37:20) {#each gradient_c as c}
function create_each_block_2(component, state) {
	var c = state.c, each_value_2 = state.each_value_2, c_index_2 = state.c_index_2;
	var div, div_class_value, div_data_color_value;

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			addListener(div, "click", click_handler_2);
			div.className = div_class_value = "color " + (c == state.nearest_c?'selected':'') + " svelte-53boxl";
			div.dataset.color = div_data_color_value = c;
			setStyle(div, "background", c);

			div._svelte = {
				component: component,
				each_value_2: state.each_value_2,
				c_index_2: state.c_index_2
			};
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
		},

		p: function update(changed, state) {
			c = state.c;
			each_value_2 = state.each_value_2;
			c_index_2 = state.c_index_2;
			if ((changed.gradient_c || changed.nearest_c) && div_class_value !== (div_class_value = "color " + (c == state.nearest_c?'selected':'') + " svelte-53boxl")) {
				div.className = div_class_value;
			}

			if ((changed.gradient_c) && div_data_color_value !== (div_data_color_value = c)) {
				div.dataset.color = div_data_color_value;
			}

			if (changed.gradient_c) {
				setStyle(div, "background", c);
			}

			div._svelte.each_value_2 = state.each_value_2;
			div._svelte.c_index_2 = state.c_index_2;
		},

		u: function unmount() {
			detachNode(div);
		},

		d: function destroy$$1() {
			removeListener(div, "click", click_handler_2);
		}
	};
}

// (42:20) {#each gradient_h as c}
function create_each_block_3(component, state) {
	var c = state.c, each_value_3 = state.each_value_3, c_index_3 = state.c_index_3;
	var div, div_class_value, div_data_color_value;

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			addListener(div, "click", click_handler_3);
			div.className = div_class_value = "color " + (c == state.nearest_h?'selected':'') + " svelte-53boxl";
			div.dataset.color = div_data_color_value = c;
			setStyle(div, "background", c);

			div._svelte = {
				component: component,
				each_value_3: state.each_value_3,
				c_index_3: state.c_index_3
			};
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
		},

		p: function update(changed, state) {
			c = state.c;
			each_value_3 = state.each_value_3;
			c_index_3 = state.c_index_3;
			if ((changed.gradient_h || changed.nearest_h) && div_class_value !== (div_class_value = "color " + (c == state.nearest_h?'selected':'') + " svelte-53boxl")) {
				div.className = div_class_value;
			}

			if ((changed.gradient_h) && div_data_color_value !== (div_data_color_value = c)) {
				div.dataset.color = div_data_color_value;
			}

			if (changed.gradient_h) {
				setStyle(div, "background", c);
			}

			div._svelte.each_value_3 = state.each_value_3;
			div._svelte.c_index_3 = state.c_index_3;
		},

		u: function unmount() {
			detachNode(div);
		},

		d: function destroy$$1() {
			removeListener(div, "click", click_handler_3);
		}
	};
}

// (46:16) {#if reset}
function create_if_block_1$1(component, state) {
	var button, i, text, raw_before;

	function click_handler_4(event) {
		component.resetColor();
	}

	return {
		c: function create() {
			button = createElement("button");
			i = createElement("i");
			text = createText(" ");
			raw_before = createElement('noscript');
			this.h();
		},

		h: function hydrate() {
			i.className = "im im-drop svelte-53boxl";
			addListener(button, "click", click_handler_4);
			button.className = "btn btn-small reset svelte-53boxl";
		},

		m: function mount(target, anchor) {
			insertNode(button, target, anchor);
			appendNode(i, button);
			appendNode(text, button);
			appendNode(raw_before, button);
			raw_before.insertAdjacentHTML("afterend", state.reset);
		},

		p: function update(changed, state) {
			if (changed.reset) {
				detachAfter(raw_before);
				raw_before.insertAdjacentHTML("afterend", state.reset);
			}
		},

		u: function unmount() {
			detachAfter(raw_before);

			detachNode(button);
		},

		d: function destroy$$1() {
			removeListener(button, "click", click_handler_4);
		}
	};
}

// (14:12) {#if color_}
function create_if_block$3(component, state) {
	var div, div_1, text_1, div_2, text_3, div_3, text_5, div_4, text_7, text_8, div_5, input, input_updating = false, text_9, button, text_11, div_6, div_7;

	var each_value = state.palette;

	var each_blocks = [];

	for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
		each_blocks[i_1] = create_each_block(component, assign(assign({}, state), {
			each_value: each_value,
			c: each_value[i_1],
			c_index: i_1
		}));
	}

	var each_value_1 = state.gradient_l;

	var each_1_blocks = [];

	for (var i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
		each_1_blocks[i_1] = create_each_block_1(component, assign(assign({}, state), {
			each_value_1: each_value_1,
			c: each_value_1[i_1],
			c_index_1: i_1
		}));
	}

	var each_value_2 = state.gradient_c;

	var each_2_blocks = [];

	for (var i_1 = 0; i_1 < each_value_2.length; i_1 += 1) {
		each_2_blocks[i_1] = create_each_block_2(component, assign(assign({}, state), {
			each_value_2: each_value_2,
			c: each_value_2[i_1],
			c_index_2: i_1
		}));
	}

	var each_value_3 = state.gradient_h;

	var each_3_blocks = [];

	for (var i_1 = 0; i_1 < each_value_3.length; i_1 += 1) {
		each_3_blocks[i_1] = create_each_block_3(component, assign(assign({}, state), {
			each_value_3: each_value_3,
			c: each_value_3[i_1],
			c_index_3: i_1
		}));
	}

	var if_block = (state.reset) && create_if_block_1$1(component, state);

	function input_input_handler() {
		input_updating = true;
		component.set({ color_: input.value });
		input_updating = false;
	}

	function click_handler_4(event) {
		var state = component.get();
		component.setColor(state.color_, true);
	}

	function click_handler_5(event) {
		event.stopPropagation();
	}

	return {
		c: function create() {
			div = createElement("div");
			div_1 = createElement("div");

			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
				each_blocks[i_1].c();
			}

			text_1 = createText("\n\n                ");
			div_2 = createElement("div");

			for (var i_1 = 0; i_1 < each_1_blocks.length; i_1 += 1) {
				each_1_blocks[i_1].c();
			}

			text_3 = createText("\n                ");
			div_3 = createElement("div");

			for (var i_1 = 0; i_1 < each_2_blocks.length; i_1 += 1) {
				each_2_blocks[i_1].c();
			}

			text_5 = createText("\n                ");
			div_4 = createElement("div");

			for (var i_1 = 0; i_1 < each_3_blocks.length; i_1 += 1) {
				each_3_blocks[i_1].c();
			}

			text_7 = createText("\n                ");
			if (if_block) { if_block.c(); }
			text_8 = createText("\n                ");
			div_5 = createElement("div");
			input = createElement("input");
			text_9 = createText("\n                    ");
			button = createElement("button");
			button.innerHTML = "<i class=\"icon-ok\"></i>";
			text_11 = createText("\n                    ");
			div_6 = createElement("div");
			div_7 = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div_1.className = "palette svelte-53boxl";
			div_2.className = "color-axis lightness svelte-53boxl";
			div_3.className = "color-axis saturation svelte-53boxl";
			div_4.className = "color-axis hue svelte-53boxl";
			addListener(input, "input", input_input_handler);
			setAttribute(input, "type", "text");
			setStyle(input, "background", state.color_);
			setStyle(input, "border-color", borderColor(state.color_));
			setStyle(input, "color", state.textColor);
			input.className = "hex svelte-53boxl";
			addListener(button, "click", click_handler_4);
			button.className = "btn btn-small ok svelte-53boxl";
			div_7.className = "transparency svelte-53boxl";
			setStyle(div_7, "opacity", ( 1-alpha(state.color_) ));
			div_6.className = "color selected svelte-53boxl";
			setStyle(div_6, "border-color", borderColor(state.color_));
			setStyle(div_6, "background", state.color_);
			div_5.className = "footer svelte-53boxl";
			addListener(div, "click", click_handler_5);
			div.className = "color-selector svelte-53boxl";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(div_1, div);

			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
				each_blocks[i_1].m(div_1, null);
			}

			appendNode(text_1, div);
			appendNode(div_2, div);

			for (var i_1 = 0; i_1 < each_1_blocks.length; i_1 += 1) {
				each_1_blocks[i_1].m(div_2, null);
			}

			appendNode(text_3, div);
			appendNode(div_3, div);

			for (var i_1 = 0; i_1 < each_2_blocks.length; i_1 += 1) {
				each_2_blocks[i_1].m(div_3, null);
			}

			appendNode(text_5, div);
			appendNode(div_4, div);

			for (var i_1 = 0; i_1 < each_3_blocks.length; i_1 += 1) {
				each_3_blocks[i_1].m(div_4, null);
			}

			appendNode(text_7, div);
			if (if_block) { if_block.m(div, null); }
			appendNode(text_8, div);
			appendNode(div_5, div);
			appendNode(input, div_5);

			input.value = state.color_;

			appendNode(text_9, div_5);
			appendNode(button, div_5);
			appendNode(text_11, div_5);
			appendNode(div_6, div_5);
			appendNode(div_7, div_6);
		},

		p: function update(changed, state) {
			var each_value = state.palette;

			if (changed.palette) {
				for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						c: each_value[i_1],
						c_index: i_1
					});

					if (each_blocks[i_1]) {
						each_blocks[i_1].p(changed, each_context);
					} else {
						each_blocks[i_1] = create_each_block(component, each_context);
						each_blocks[i_1].c();
						each_blocks[i_1].m(div_1, null);
					}
				}

				for (; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].u();
					each_blocks[i_1].d();
				}
				each_blocks.length = each_value.length;
			}

			var each_value_1 = state.gradient_l;

			if (changed.gradient_l || changed.nearest_l) {
				for (var i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
					var each_1_context = assign(assign({}, state), {
						each_value_1: each_value_1,
						c: each_value_1[i_1],
						c_index_1: i_1
					});

					if (each_1_blocks[i_1]) {
						each_1_blocks[i_1].p(changed, each_1_context);
					} else {
						each_1_blocks[i_1] = create_each_block_1(component, each_1_context);
						each_1_blocks[i_1].c();
						each_1_blocks[i_1].m(div_2, null);
					}
				}

				for (; i_1 < each_1_blocks.length; i_1 += 1) {
					each_1_blocks[i_1].u();
					each_1_blocks[i_1].d();
				}
				each_1_blocks.length = each_value_1.length;
			}

			var each_value_2 = state.gradient_c;

			if (changed.gradient_c || changed.nearest_c) {
				for (var i_1 = 0; i_1 < each_value_2.length; i_1 += 1) {
					var each_2_context = assign(assign({}, state), {
						each_value_2: each_value_2,
						c: each_value_2[i_1],
						c_index_2: i_1
					});

					if (each_2_blocks[i_1]) {
						each_2_blocks[i_1].p(changed, each_2_context);
					} else {
						each_2_blocks[i_1] = create_each_block_2(component, each_2_context);
						each_2_blocks[i_1].c();
						each_2_blocks[i_1].m(div_3, null);
					}
				}

				for (; i_1 < each_2_blocks.length; i_1 += 1) {
					each_2_blocks[i_1].u();
					each_2_blocks[i_1].d();
				}
				each_2_blocks.length = each_value_2.length;
			}

			var each_value_3 = state.gradient_h;

			if (changed.gradient_h || changed.nearest_h) {
				for (var i_1 = 0; i_1 < each_value_3.length; i_1 += 1) {
					var each_3_context = assign(assign({}, state), {
						each_value_3: each_value_3,
						c: each_value_3[i_1],
						c_index_3: i_1
					});

					if (each_3_blocks[i_1]) {
						each_3_blocks[i_1].p(changed, each_3_context);
					} else {
						each_3_blocks[i_1] = create_each_block_3(component, each_3_context);
						each_3_blocks[i_1].c();
						each_3_blocks[i_1].m(div_4, null);
					}
				}

				for (; i_1 < each_3_blocks.length; i_1 += 1) {
					each_3_blocks[i_1].u();
					each_3_blocks[i_1].d();
				}
				each_3_blocks.length = each_value_3.length;
			}

			if (state.reset) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block_1$1(component, state);
					if_block.c();
					if_block.m(div, text_8);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			if (!input_updating) { input.value = state.color_; }
			if (changed.color_) {
				setStyle(input, "background", state.color_);
				setStyle(input, "border-color", borderColor(state.color_));
			}

			if (changed.textColor) {
				setStyle(input, "color", state.textColor);
			}

			if (changed.color_) {
				setStyle(div_7, "opacity", ( 1-alpha(state.color_) ));
				setStyle(div_6, "border-color", borderColor(state.color_));
				setStyle(div_6, "background", state.color_);
			}
		},

		u: function unmount() {
			detachNode(div);

			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
				each_blocks[i_1].u();
			}

			for (var i_1 = 0; i_1 < each_1_blocks.length; i_1 += 1) {
				each_1_blocks[i_1].u();
			}

			for (var i_1 = 0; i_1 < each_2_blocks.length; i_1 += 1) {
				each_2_blocks[i_1].u();
			}

			for (var i_1 = 0; i_1 < each_3_blocks.length; i_1 += 1) {
				each_3_blocks[i_1].u();
			}

			if (if_block) { if_block.u(); }
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			destroyEach(each_1_blocks);

			destroyEach(each_2_blocks);

			destroyEach(each_3_blocks);

			if (if_block) { if_block.d(); }
			removeListener(input, "input", input_input_handler);
			removeListener(button, "click", click_handler_4);
			removeListener(div, "click", click_handler_5);
		}
	};
}

function click_handler(event) {
	var component = this._svelte.component;
	var each_value = this._svelte.each_value, c_index = this._svelte.c_index, c = each_value[c_index];
	component.setColor(c, false);
}

function dblclick_handler(event) {
	var component = this._svelte.component;
	var each_value = this._svelte.each_value, c_index = this._svelte.c_index, c = each_value[c_index];
	component.setColor(c, true);
}

function click_handler_1(event) {
	var component = this._svelte.component;
	var each_value_1 = this._svelte.each_value_1, c_index_1 = this._svelte.c_index_1, c = each_value_1[c_index_1];
	component.setColor(c, false);
}

function click_handler_2(event) {
	var component = this._svelte.component;
	var each_value_2 = this._svelte.each_value_2, c_index_2 = this._svelte.c_index_2, c = each_value_2[c_index_2];
	component.setColor(c, false);
}

function click_handler_3(event) {
	var component = this._svelte.component;
	var each_value_3 = this._svelte.each_value_3, c_index_3 = this._svelte.c_index_3, c = each_value_3[c_index_3];
	component.setColor(c, false);
}

function ColorPicker(options) {
	this._debugName = '<ColorPicker>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this.refs = {};
	this._state = assign(assign(this.store._init(["themeData"]), data$4()), options.data);
	this.store._add(this, ["themeData"]);
	this._recompute({ $themeData: 1, prepend: 1, append: 1, color_: 1, palette: 1, gradient_l: 1, gradient_c: 1, gradient_h: 1 }, this._state);
	if (!('$themeData' in this._state)) { console.warn("<ColorPicker> was created without expected data property '$themeData'"); }
	if (!('prepend' in this._state)) { console.warn("<ColorPicker> was created without expected data property 'prepend'"); }
	if (!('append' in this._state)) { console.warn("<ColorPicker> was created without expected data property 'append'"); }
	if (!('color_' in this._state)) { console.warn("<ColorPicker> was created without expected data property 'color_'"); }




	if (!('open' in this._state)) { console.warn("<ColorPicker> was created without expected data property 'open'"); }




	if (!('reset' in this._state)) { console.warn("<ColorPicker> was created without expected data property 'reset'"); }
	this._handlers.update = [onupdate$1];

	this._handlers.destroy = [removeFromStore];

	this._slotted = options.slots || {};

	var self = this;
	var _oncreate = function() {
		var changed = { $themeData: 1, prepend: 1, append: 1, color_: 1, palette: 1, gradient_l: 1, gradient_c: 1, gradient_h: 1, open: 1, validColor: 1, nearest_l: 1, nearest_c: 1, nearest_h: 1, reset: 1, textColor: 1 };
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this.slots = {};

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

assign(ColorPicker.prototype, protoDev);
assign(ColorPicker.prototype, methods$3);

ColorPicker.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('palette' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'palette'"); }
	if ('validColor' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'validColor'"); }
	if ('gradient_l' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'gradient_l'"); }
	if ('gradient_c' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'gradient_c'"); }
	if ('gradient_h' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'gradient_h'"); }
	if ('nearest_l' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'nearest_l'"); }
	if ('nearest_c' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'nearest_c'"); }
	if ('nearest_h' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'nearest_h'"); }
	if ('textColor' in newState && !this._updatingReadonlyProperty) { throw new Error("<ColorPicker>: Cannot set read-only property 'textColor'"); }
};

ColorPicker.prototype._recompute = function _recompute(changed, state) {
	if (changed.$themeData || changed.prepend || changed.append) {
		if (this._differs(state.palette, (state.palette = palette(state)))) { changed.palette = true; }
	}

	if (changed.color_) {
		if (this._differs(state.validColor, (state.validColor = validColor(state)))) { changed.validColor = true; }
		if (this._differs(state.gradient_l, (state.gradient_l = gradient_l(state)))) { changed.gradient_l = true; }
	}

	if (changed.color_ || changed.palette) {
		if (this._differs(state.gradient_c, (state.gradient_c = gradient_c(state)))) { changed.gradient_c = true; }
	}

	if (changed.color_) {
		if (this._differs(state.gradient_h, (state.gradient_h = gradient_h(state)))) { changed.gradient_h = true; }
	}

	if (changed.color_ || changed.gradient_l) {
		if (this._differs(state.nearest_l, (state.nearest_l = nearest_l(state)))) { changed.nearest_l = true; }
	}

	if (changed.color_ || changed.gradient_c) {
		if (this._differs(state.nearest_c, (state.nearest_c = nearest_c(state)))) { changed.nearest_c = true; }
	}

	if (changed.color_ || changed.gradient_h) {
		if (this._differs(state.nearest_h, (state.nearest_h = nearest_h(state)))) { changed.nearest_h = true; }
	}

	if (changed.color_) {
		if (this._differs(state.textColor, (state.textColor = textColor(state)))) { changed.textColor = true; }
	}
};

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/ControlGroup.html generated by Svelte v1.64.0 */

function data$5() {
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

function create_main_fragment$5(component, state) {
	var div, text, div_1, slot_content_default = component._slotted.default, slot_content_default_after, text_1, div_class_value;

	var if_block = (state.label) && create_if_block$4(component, state);

	var if_block_1 = (state.help) && create_if_block_1$2(component, state);

	return {
		c: function create() {
			div = createElement("div");
			if (if_block) { if_block.c(); }
			text = createText("\n    ");
			div_1 = createElement("div");
			text_1 = createText("\n        ");
			if (if_block_1) { if_block_1.c(); }
			this.h();
		},

		h: function hydrate() {
			div_1.className = "controls svelte-1lchyq2";
			setAttribute(div_1, "class:form-inline", "inline");
			setStyle(div_1, "width", "calc(100% - " + ( state.width||def.width ) + " - 40px)");
			div.className = div_class_value = "control-group vis-option-group vis-option-group-" + state.type + " label-" + state.valign + " svelte-1lchyq2";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			if (if_block) { if_block.m(div, null); }
			appendNode(text, div);
			appendNode(div_1, div);

			if (slot_content_default) {
				appendNode(slot_content_default, div_1);
				appendNode(slot_content_default_after || (slot_content_default_after = createComment()), div_1);
			}

			appendNode(text_1, div_1);
			if (if_block_1) { if_block_1.m(div_1, null); }
		},

		p: function update(changed, state) {
			if (state.label) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$4(component, state);
					if_block.c();
					if_block.m(div, text);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			if (state.help) {
				if (if_block_1) {
					if_block_1.p(changed, state);
				} else {
					if_block_1 = create_if_block_1$2(component, state);
					if_block_1.c();
					if_block_1.m(div_1, null);
				}
			} else if (if_block_1) {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = null;
			}

			if (changed.width) {
				setStyle(div_1, "width", "calc(100% - " + ( state.width||def.width ) + " - 40px)");
			}

			if ((changed.type || changed.valign) && div_class_value !== (div_class_value = "control-group vis-option-group vis-option-group-" + state.type + " label-" + state.valign + " svelte-1lchyq2")) {
				div.className = div_class_value;
			}
		},

		u: function unmount() {
			detachNode(div);
			if (if_block) { if_block.u(); }

			if (slot_content_default) {
				reinsertBefore(slot_content_default_after, slot_content_default);
			}

			if (if_block_1) { if_block_1.u(); }
		},

		d: function destroy$$1() {
			if (if_block) { if_block.d(); }
			if (if_block_1) { if_block_1.d(); }
		}
	};
}

// (2:4) {#if label}
function create_if_block$4(component, state) {
	var label;

	return {
		c: function create() {
			label = createElement("label");
			this.h();
		},

		h: function hydrate() {
			setStyle(label, "width", ( state.width||def.width ));
			setAttribute(label, "class:disabled", true);
			label.className = "control-label svelte-1lchyq2";
		},

		m: function mount(target, anchor) {
			insertNode(label, target, anchor);
			label.innerHTML = state.label;
		},

		p: function update(changed, state) {
			if (changed.label) {
				label.innerHTML = state.label;
			}

			if (changed.width) {
				setStyle(label, "width", ( state.width||def.width ));
			}
		},

		u: function unmount() {
			label.innerHTML = '';

			detachNode(label);
		},

		d: noop
	};
}

// (7:8) {#if help}
function create_if_block_1$2(component, state) {
	var p;

	return {
		c: function create() {
			p = createElement("p");
			this.h();
		},

		h: function hydrate() {
			p.className = "mini-help svelte-1lchyq2";
		},

		m: function mount(target, anchor) {
			insertNode(p, target, anchor);
			p.innerHTML = state.help;
		},

		p: function update(changed, state) {
			if (changed.help) {
				p.innerHTML = state.help;
			}
		},

		u: function unmount() {
			p.innerHTML = '';

			detachNode(p);
		},

		d: noop
	};
}

function ControlGroup(options) {
	this._debugName = '<ControlGroup>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data$5(), options.data);
	if (!('type' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'type'"); }
	if (!('valign' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'valign'"); }
	if (!('label' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'label'"); }
	if (!('width' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'width'"); }
	if (!('help' in this._state)) { console.warn("<ControlGroup> was created without expected data property 'help'"); }

	this._slotted = options.slots || {};

	this.slots = {};

	this._fragment = create_main_fragment$5(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(ControlGroup.prototype, protoDev);

ControlGroup.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/**
 * Remove all html tags from the given string
 *
 * written by Kevin van Zonneveld et.al.
 * taken from https://github.com/kvz/phpjs/blob/master/functions/strings/strip_tags.js
 */
var TAGS = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
var COMMENTS_AND_PHP_TAGS = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
var defaultAllowed = '<a><b><br><br/><i><strong><sup><sub><strike><u><em><tt>';

function purifyHtml(input, allowed) {
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

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/Color.html generated by Svelte v1.64.0 */

function palette_1(ref) {
    var $themeData = ref.$themeData;

    return $themeData.colors.palette;
}
function colorKeys(ref) {
    var $vis = ref.$vis;
    var keys = ref.keys;
    var customizable = ref.customizable;
    var axis = ref.axis;
    var custom = ref.custom;
    var palette = ref.palette;

    if (!$vis || !customizable) { return []; }
    return (axis
        ? underscore.uniq(
              $vis.axes(true)[axis].type() === 'date'
                  ? $vis.axes(true)[axis].raw() // raw values for date cols
                  : $vis.axes(true)[axis].values() // fmt values else
          )
        : keys && keys.length
        ? keys
        : $vis.colorKeys
        ? $vis.colorKeys()
        : $vis.keys()
    ).map(function (k) {
        k = stripTags$1(k);
        return {
            key: k,
            defined: custom[k] !== undefined && custom[k] !== false,
            color: custom[k] !== undefined && custom[k] !== false ? getColor(custom[k], palette) : '#cccccc'
        };
    });
}
function hexColor(ref) {
    var value = ref.value;
    var palette = ref.palette;

    return getColor(value, palette);
}
function customColor(ref) {
    var selected = ref.selected;
    var palette = ref.palette;
    var custom = ref.custom;

    if (custom[selected[0]] === undefined) { return '#ccc'; }
    var realColors = selected.filter(function (s) { return custom[s] !== undefined; }).map(function (s) { return getColor(custom[s], palette); });
    if (!realColors.length) { return '#ccc'; }
    // if (realColors.length == 1) return realColors[0];
    return chroma.average(realColors, 'lab');
}
function data$6() {
    return {
        width: '100px',
        open: false,
        openCustom: false,
        customizable: false,
        expanded: false,
        keys: false,
        compact: false,
        axis: false,
        selected: [],
        custom: {}
    };
}
var methods$4 = {
    update: function update(color) {
        var ref = this.get();
        var palette = ref.palette;
        this.set({ value: storeColor(color, palette) });
    },
    updateCustom: function updateCustom(color) {
        var ref = this.get();
        var selected = ref.selected;
        var palette = ref.palette;
        var custom = ref.custom;
        selected.forEach(function (k) {
            if (color) {
                custom[k] = storeColor(color, palette);
            } else {
                delete custom[k];
            }
        });
        this.set({ custom: custom });
    },
    toggle: function toggle(event) {
        event.preventDefault();
        var ref = this.get();
        var expanded = ref.expanded;
        this.set({ expanded: !expanded });
    },
    toggleSelect: function toggleSelect(k, event) {
        event.preventDefault();
        var ref = this.get();
        var selected = ref.selected;
        var i = selected.indexOf(k);
        if (event.shiftKey) {
            if (i > -1) { selected.splice(i, 1); }
            else { selected.push(k); }
        } else {
            selected.length = 1;
            selected[0] = k;
        }
        this.set({ selected: selected });
    },
    getColor: function getColor$1(color) {
        var ref = this.get();
        var palette = ref.palette;
        return getColor(color, palette);
    },
    reset: function reset() {
        var ref = this.get();
        var selected = ref.selected;
        var custom = ref.custom;
        selected.forEach(function (k) { return delete custom[k]; });
        this.set({ custom: custom });
    },
    resetAll: function resetAll() {
        var ref = this.get();
        var custom = ref.custom;
        Object.keys(custom).forEach(function (k) { return delete custom[k]; });
        this.set({ custom: custom });
    },
    selectAll: function selectAll(event) {
        event.preventDefault();
        var ref = this.get();
        var selected = ref.selected;
        var colorKeys = ref.colorKeys;
        colorKeys.forEach(function (k) {
            if (selected.indexOf(k.key) < 0) { selected.push(k.key); }
        });
        this.set({ selected: selected });
    },
    selectNone: function selectNone(event) {
        event.preventDefault();
        var ref = this.get();
        var selected = ref.selected;
        selected.length = 0;
        this.set({ selected: selected });
    },
    selectInvert: function selectInvert(event) {
        event.preventDefault();
        var ref = this.get();
        var selected = ref.selected;
        var colorKeys = ref.colorKeys;
        colorKeys.forEach(function (k) {
            var i = selected.indexOf(k.key);
            if (i < 0) { selected.push(k.key); }
            else { selected.splice(i, 1); }
        });
        this.set({ selected: selected });
    }
};

function onupdate$2(ref) {
    var changed = ref.changed;
    var current = ref.current;

    if (changed.custom) {
        var c = current.custom;
        if (c && c.length === 0) {
            c = {};
        }
        this.set({ custom: c });
    }
}
function storeColor(color, palette) {
    var pi = palette.indexOf(color);
    if (pi > -1) { return pi; }
    return color;
}

function getColor(color, palette) {
    return typeof color === 'number' ? palette[color % palette.length] : color;
}

function stripTags$1(s) {
    return purifyHtml(s, '');
}

function create_main_fragment$6(component, state) {
	var text, if_block_anchor, text_1, if_block_1_anchor, text_2, text_3, if_block_2_anchor;

	var if_block = (state.hexColor) && create_if_block$5(component, state);

	var if_block_1 = (state.customizable) && create_if_block_1$3(component, state);

	var controlgroup_initial_data = { label: state.label, width: state.width||'100px' };
	var controlgroup = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_initial_data
	});

	var if_block_2 = (state.customizable && state.expanded) && create_if_block_2(component, state);

	return {
		c: function create() {
			text = createText("\n    ");
			if (if_block) { if_block.c(); }
			if_block_anchor = createComment();
			text_1 = createText(" ");
			if (if_block_1) { if_block_1.c(); }
			if_block_1_anchor = createComment();
			text_2 = createText("\n");
			controlgroup._fragment.c();
			text_3 = createText("\n\n");
			if (if_block_2) { if_block_2.c(); }
			if_block_2_anchor = createComment();
		},

		m: function mount(target, anchor) {
			appendNode(text, controlgroup._slotted.default);
			if (if_block) { if_block.m(controlgroup._slotted.default, null); }
			appendNode(if_block_anchor, controlgroup._slotted.default);
			appendNode(text_1, controlgroup._slotted.default);
			if (if_block_1) { if_block_1.m(controlgroup._slotted.default, null); }
			appendNode(if_block_1_anchor, controlgroup._slotted.default);
			appendNode(text_2, controlgroup._slotted.default);
			controlgroup._mount(target, anchor);
			insertNode(text_3, target, anchor);
			if (if_block_2) { if_block_2.m(target, anchor); }
			insertNode(if_block_2_anchor, target, anchor);
		},

		p: function update(changed, state) {
			if (state.hexColor) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$5(component, state);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			if (state.customizable) {
				if (if_block_1) {
					if_block_1.p(changed, state);
				} else {
					if_block_1 = create_if_block_1$3(component, state);
					if_block_1.c();
					if_block_1.m(if_block_1_anchor.parentNode, if_block_1_anchor);
				}
			} else if (if_block_1) {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = null;
			}

			var controlgroup_changes = {};
			if (changed.label) { controlgroup_changes.label = state.label; }
			if (changed.width) { controlgroup_changes.width = state.width||'100px'; }
			controlgroup._set(controlgroup_changes);

			if (state.customizable && state.expanded) {
				if (if_block_2) {
					if_block_2.p(changed, state);
				} else {
					if_block_2 = create_if_block_2(component, state);
					if_block_2.c();
					if_block_2.m(if_block_2_anchor.parentNode, if_block_2_anchor);
				}
			} else if (if_block_2) {
				if_block_2.u();
				if_block_2.d();
				if_block_2 = null;
			}
		},

		u: function unmount() {
			if (if_block) { if_block.u(); }
			if (if_block_1) { if_block_1.u(); }
			controlgroup._unmount();
			detachNode(text_3);
			if (if_block_2) { if_block_2.u(); }
			detachNode(if_block_2_anchor);
		},

		d: function destroy$$1() {
			if (if_block) { if_block.d(); }
			if (if_block_1) { if_block_1.d(); }
			controlgroup.destroy(false);
			if (if_block_2) { if_block_2.d(); }
		}
	};
}

// (2:4) {#if hexColor}
function create_if_block$5(component, state) {
	var colorpicker_updating = {};

	var colorpicker_initial_data = { color: state.hexColor, palette: state.palette };
	if ('open' in state) {
		colorpicker_initial_data.visible = state.open;
		colorpicker_updating.visible = true;
	}
	var colorpicker = new ColorPicker({
		root: component.root,
		data: colorpicker_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!colorpicker_updating.visible && changed.visible) {
				newState.open = childState.visible;
			}
			component._set(newState);
			colorpicker_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		colorpicker._bind({ visible: 1 }, colorpicker.get());
	});

	colorpicker.on("change", function(event) {
		component.update(event);
	});

	return {
		c: function create() {
			colorpicker._fragment.c();
		},

		m: function mount(target, anchor) {
			colorpicker._mount(target, anchor);
		},

		p: function update(changed, state) {
			var colorpicker_changes = {};
			if (changed.hexColor) { colorpicker_changes.color = state.hexColor; }
			if (changed.palette) { colorpicker_changes.palette = state.palette; }
			if (!colorpicker_updating.visible && changed.open) {
				colorpicker_changes.visible = state.open;
				colorpicker_updating.visible = true;
			}
			colorpicker._set(colorpicker_changes);
			colorpicker_updating = {};
		},

		u: function unmount() {
			colorpicker._unmount();
		},

		d: function destroy$$1() {
			colorpicker.destroy(false);
		}
	};
}

// (4:10) {#if customizable}
function create_if_block_1$3(component, state) {
	var span, a, a_class_value;

	function click_handler(event) {
		component.toggle(event);
	}

	return {
		c: function create() {
			span = createElement("span");
			a = createElement("a");
			a.textContent = "customize colors...";
			this.h();
		},

		h: function hydrate() {
			addListener(a, "click", click_handler);
			a.href = "#customize";
			a.className = a_class_value = "btn btn-small custom " + (state.expanded?'btn-primary':'');
			setAttribute(a, "role", "button");
			span.className = "custom-color-selector-head";
		},

		m: function mount(target, anchor) {
			insertNode(span, target, anchor);
			appendNode(a, span);
		},

		p: function update(changed, state) {
			if ((changed.expanded) && a_class_value !== (a_class_value = "btn btn-small custom " + (state.expanded?'btn-primary':''))) {
				a.className = a_class_value;
			}
		},

		u: function unmount() {
			detachNode(span);
		},

		d: function destroy$$1() {
			removeListener(a, "click", click_handler);
		}
	};
}

// (15:12) {#if !compact}
function create_if_block_3(component, state) {
	var h4;

	return {
		c: function create() {
			h4 = createElement("h4");
			h4.textContent = "Select element(s):";
			this.h();
		},

		h: function hydrate() {
			h4.className = "svelte-45slus";
		},

		m: function mount(target, anchor) {
			insertNode(h4, target, anchor);
		},

		u: function unmount() {
			detachNode(h4);
		},

		d: noop
	};
}

// (19:16) {#each colorKeys as k}
function create_each_block$1(component, state) {
	var k = state.k, each_value = state.each_value, k_index = state.k_index;
	var li, div, text_value = !k.defined ? '×' : '', text, text_1, label, text_2_value = k.key, text_2, li_class_value, li_data_series_value;

	return {
		c: function create() {
			li = createElement("li");
			div = createElement("div");
			text = createText(text_value);
			text_1 = createText("\n                    ");
			label = createElement("label");
			text_2 = createText(text_2_value);
			this.h();
		},

		h: function hydrate() {
			div.className = "color svelte-45slus";
			setStyle(div, "background", k.color);
			label.className = "svelte-45slus";
			addListener(li, "click", click_handler$1);
			li.className = li_class_value = "" + (state.selected.indexOf(k.key) > -1 ? 'selected':'') + " svelte-45slus";
			li.dataset.series = li_data_series_value = k.key;

			li._svelte = {
				component: component,
				each_value: state.each_value,
				k_index: state.k_index
			};
		},

		m: function mount(target, anchor) {
			insertNode(li, target, anchor);
			appendNode(div, li);
			appendNode(text, div);
			appendNode(text_1, li);
			appendNode(label, li);
			appendNode(text_2, label);
		},

		p: function update(changed, state) {
			k = state.k;
			each_value = state.each_value;
			k_index = state.k_index;
			if ((changed.colorKeys) && text_value !== (text_value = !k.defined ? '×' : '')) {
				text.data = text_value;
			}

			if (changed.colorKeys) {
				setStyle(div, "background", k.color);
			}

			if ((changed.colorKeys) && text_2_value !== (text_2_value = k.key)) {
				text_2.data = text_2_value;
			}

			if ((changed.selected || changed.colorKeys) && li_class_value !== (li_class_value = "" + (state.selected.indexOf(k.key) > -1 ? 'selected':'') + " svelte-45slus")) {
				li.className = li_class_value;
			}

			if ((changed.colorKeys) && li_data_series_value !== (li_data_series_value = k.key)) {
				li.dataset.series = li_data_series_value;
			}

			li._svelte.each_value = state.each_value;
			li._svelte.k_index = state.k_index;
		},

		u: function unmount() {
			detachNode(li);
		},

		d: function destroy$$1() {
			removeListener(li, "click", click_handler$1);
		}
	};
}

// (33:12) {#if !compact}
function create_if_block_4(component, state) {
	var h4;

	return {
		c: function create() {
			h4 = createElement("h4");
			h4.textContent = "Choose a color:";
			this.h();
		},

		h: function hydrate() {
			h4.className = "svelte-45slus";
		},

		m: function mount(target, anchor) {
			insertNode(h4, target, anchor);
		},

		u: function unmount() {
			detachNode(h4);
		},

		d: noop
	};
}

// (45:16) {#if !compact}
function create_if_block_6(component, state) {
	var button;

	function click_handler_1(event) {
		component.reset();
	}

	return {
		c: function create() {
			button = createElement("button");
			button.textContent = "Reset";
			this.h();
		},

		h: function hydrate() {
			addListener(button, "click", click_handler_1);
			button.className = "btn";
		},

		m: function mount(target, anchor) {
			insertNode(button, target, anchor);
		},

		u: function unmount() {
			detachNode(button);
		},

		d: function destroy$$1() {
			removeListener(button, "click", click_handler_1);
		}
	};
}

// (35:18) {#if selected.length}
function create_if_block_5(component, state) {
	var div, colorpicker_updating = {}, text;

	var colorpicker_initial_data = {
	 	initial: false,
	 	reset: "Reset",
	 	color: state.customColor,
	 	palette: state.palette
	 };
	if ('openCustom' in state) {
		colorpicker_initial_data.visible = state.openCustom;
		colorpicker_updating.visible = true;
	}
	var colorpicker = new ColorPicker({
		root: component.root,
		data: colorpicker_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!colorpicker_updating.visible && changed.visible) {
				newState.openCustom = childState.visible;
			}
			component._set(newState);
			colorpicker_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		colorpicker._bind({ visible: 1 }, colorpicker.get());
	});

	colorpicker.on("change", function(event) {
		component.updateCustom(event);
	});

	var if_block = (!state.compact) && create_if_block_6(component, state);

	return {
		c: function create() {
			div = createElement("div");
			colorpicker._fragment.c();
			text = createText("\n                ");
			if (if_block) { if_block.c(); }
			this.h();
		},

		h: function hydrate() {
			div.className = "select";
			setStyle(div, "margin-bottom", "20px");
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			colorpicker._mount(div, null);
			appendNode(text, div);
			if (if_block) { if_block.m(div, null); }
		},

		p: function update(changed, state) {
			var colorpicker_changes = {};
			colorpicker_changes.initial = false;
			if (changed.customColor) { colorpicker_changes.color = state.customColor; }
			if (changed.palette) { colorpicker_changes.palette = state.palette; }
			if (!colorpicker_updating.visible && changed.openCustom) {
				colorpicker_changes.visible = state.openCustom;
				colorpicker_updating.visible = true;
			}
			colorpicker._set(colorpicker_changes);
			colorpicker_updating = {};

			if (!state.compact) {
				if (!if_block) {
					if_block = create_if_block_6(component, state);
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
			if (if_block) { if_block.u(); }
		},

		d: function destroy$$1() {
			colorpicker.destroy(false);
			if (if_block) { if_block.d(); }
		}
	};
}

// (47:12) {:else}
function create_if_block_7(component, state) {
	var p;

	return {
		c: function create() {
			p = createElement("p");
			p.textContent = "Please select an element on the left to change colors for individual elements...";
			this.h();
		},

		h: function hydrate() {
			p.className = "mini-help";
		},

		m: function mount(target, anchor) {
			insertNode(p, target, anchor);
		},

		p: noop,

		u: function unmount() {
			detachNode(p);
		},

		d: noop
	};
}

// (53:26) {#if !compact}
function create_if_block_8(component, state) {
	var text;

	return {
		c: function create() {
			text = createText("colors");
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

// (11:0) {#if customizable && expanded}
function create_if_block_2(component, state) {
	var div, div_1, div_2, text, ul, text_1, div_3, text_2, a, text_4, a_1, text_6, a_2, text_10, div_4, text_11, text_12, button, text_13;

	var if_block = (!state.compact) && create_if_block_3(component, state);

	var each_value = state.colorKeys;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(component, assign(assign({}, state), {
			each_value: each_value,
			k: each_value[i],
			k_index: i
		}));
	}

	function click_handler_1(event) {
		component.selectAll(event);
	}

	function click_handler_2(event) {
		component.selectNone(event);
	}

	function click_handler_3(event) {
		component.selectInvert(event);
	}

	var if_block_1 = (!state.compact) && create_if_block_4(component, state);

	function select_block_type(state) {
		if (state.selected.length) { return create_if_block_5; }
		return create_if_block_7;
	}

	var current_block_type = select_block_type(state);
	var if_block_2 = current_block_type(component, state);

	var if_block_3 = (!state.compact) && create_if_block_8(component, state);

	function click_handler_4(event) {
		component.resetAll();
	}

	return {
		c: function create() {
			div = createElement("div");
			div_1 = createElement("div");
			div_2 = createElement("div");
			if (if_block) { if_block.c(); }
			text = createText("\n            ");
			ul = createElement("ul");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			text_1 = createText("\n            ");
			div_3 = createElement("div");
			text_2 = createText("Select:  \n                ");
			a = createElement("a");
			a.textContent = "all";
			text_4 = createText("   ");
			a_1 = createElement("a");
			a_1.textContent = "none";
			text_6 = createText("  \n                ");
			a_2 = createElement("a");
			a_2.textContent = "invert";
			text_10 = createText("\n        ");
			div_4 = createElement("div");
			if (if_block_1) { if_block_1.c(); }
			text_11 = createText(" ");
			if_block_2.c();
			text_12 = createText("\n            ");
			button = createElement("button");
			text_13 = createText("Reset all ");
			if (if_block_3) { if_block_3.c(); }
			this.h();
		},

		h: function hydrate() {
			ul.className = "dataseries unstyled svelte-45slus";
			addListener(a, "click", click_handler_1);
			a.href = "#/select-all";
			addListener(a_1, "click", click_handler_2);
			a_1.href = "#/select-none";
			addListener(a_2, "click", click_handler_3);
			a_2.href = "#/select-invert";
			setStyle(div_3, "font-size", "12px");
			setStyle(div_3, "text-align", "left");
			setStyle(div_3, "margin-bottom", "10px");
			div_2.className = "span2";
			setStyle(div_2, "width", "43%");
			addListener(button, "click", click_handler_4);
			button.className = "btn";
			div_4.className = "span2";
			setStyle(div_4, "width", ( state.compact ? '35%' : '42%' ));
			div_1.className = "row";
			div.className = "custom-color-selector-body svelte-45slus";
			setStyle(div, "display", "block");
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(div_1, div);
			appendNode(div_2, div_1);
			if (if_block) { if_block.m(div_2, null); }
			appendNode(text, div_2);
			appendNode(ul, div_2);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(ul, null);
			}

			appendNode(text_1, div_2);
			appendNode(div_3, div_2);
			appendNode(text_2, div_3);
			appendNode(a, div_3);
			appendNode(text_4, div_3);
			appendNode(a_1, div_3);
			appendNode(text_6, div_3);
			appendNode(a_2, div_3);
			appendNode(text_10, div_1);
			appendNode(div_4, div_1);
			if (if_block_1) { if_block_1.m(div_4, null); }
			appendNode(text_11, div_4);
			if_block_2.m(div_4, null);
			appendNode(text_12, div_4);
			appendNode(button, div_4);
			appendNode(text_13, button);
			if (if_block_3) { if_block_3.m(button, null); }
		},

		p: function update(changed, state) {
			if (!state.compact) {
				if (!if_block) {
					if_block = create_if_block_3(component, state);
					if_block.c();
					if_block.m(div_2, text);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			var each_value = state.colorKeys;

			if (changed.colorKeys || changed.selected) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						k: each_value[i],
						k_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$1(component, each_context);
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

			if (!state.compact) {
				if (!if_block_1) {
					if_block_1 = create_if_block_4(component, state);
					if_block_1.c();
					if_block_1.m(div_4, text_11);
				}
			} else if (if_block_1) {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = null;
			}

			if (current_block_type === (current_block_type = select_block_type(state)) && if_block_2) {
				if_block_2.p(changed, state);
			} else {
				if_block_2.u();
				if_block_2.d();
				if_block_2 = current_block_type(component, state);
				if_block_2.c();
				if_block_2.m(div_4, text_12);
			}

			if (!state.compact) {
				if (!if_block_3) {
					if_block_3 = create_if_block_8(component, state);
					if_block_3.c();
					if_block_3.m(button, null);
				}
			} else if (if_block_3) {
				if_block_3.u();
				if_block_3.d();
				if_block_3 = null;
			}

			if (changed.compact) {
				setStyle(div_4, "width", ( state.compact ? '35%' : '42%' ));
			}
		},

		u: function unmount() {
			detachNode(div);
			if (if_block) { if_block.u(); }

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}

			if (if_block_1) { if_block_1.u(); }
			if_block_2.u();
			if (if_block_3) { if_block_3.u(); }
		},

		d: function destroy$$1() {
			if (if_block) { if_block.d(); }

			destroyEach(each_blocks);

			removeListener(a, "click", click_handler_1);
			removeListener(a_1, "click", click_handler_2);
			removeListener(a_2, "click", click_handler_3);
			if (if_block_1) { if_block_1.d(); }
			if_block_2.d();
			if (if_block_3) { if_block_3.d(); }
			removeListener(button, "click", click_handler_4);
		}
	};
}

function click_handler$1(event) {
	var component = this._svelte.component;
	var each_value = this._svelte.each_value, k_index = this._svelte.k_index, k = each_value[k_index];
	component.toggleSelect(k.key, event);
}

function Color(options) {
	this._debugName = '<Color>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(assign(this.store._init(["vis","themeData"]), data$6()), options.data);
	this.store._add(this, ["vis","themeData"]);
	this._recompute({ $themeData: 1, $vis: 1, keys: 1, customizable: 1, axis: 1, custom: 1, palette: 1, value: 1, selected: 1 }, this._state);
	if (!('$vis' in this._state)) { console.warn("<Color> was created without expected data property '$vis'"); }
	if (!('keys' in this._state)) { console.warn("<Color> was created without expected data property 'keys'"); }
	if (!('customizable' in this._state)) { console.warn("<Color> was created without expected data property 'customizable'"); }
	if (!('axis' in this._state)) { console.warn("<Color> was created without expected data property 'axis'"); }
	if (!('custom' in this._state)) { console.warn("<Color> was created without expected data property 'custom'"); }

	if (!('$themeData' in this._state)) { console.warn("<Color> was created without expected data property '$themeData'"); }
	if (!('value' in this._state)) { console.warn("<Color> was created without expected data property 'value'"); }
	if (!('selected' in this._state)) { console.warn("<Color> was created without expected data property 'selected'"); }
	if (!('label' in this._state)) { console.warn("<Color> was created without expected data property 'label'"); }
	if (!('width' in this._state)) { console.warn("<Color> was created without expected data property 'width'"); }

	if (!('open' in this._state)) { console.warn("<Color> was created without expected data property 'open'"); }
	if (!('expanded' in this._state)) { console.warn("<Color> was created without expected data property 'expanded'"); }
	if (!('compact' in this._state)) { console.warn("<Color> was created without expected data property 'compact'"); }


	if (!('openCustom' in this._state)) { console.warn("<Color> was created without expected data property 'openCustom'"); }
	this._handlers.update = [onupdate$2];

	this._handlers.destroy = [removeFromStore];

	var self = this;
	var _oncreate = function() {
		var changed = { $vis: 1, keys: 1, customizable: 1, axis: 1, custom: 1, palette: 1, $themeData: 1, value: 1, selected: 1, label: 1, width: 1, hexColor: 1, open: 1, expanded: 1, compact: 1, colorKeys: 1, customColor: 1, openCustom: 1 };
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$6(this, this._state);

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

assign(Color.prototype, protoDev);
assign(Color.prototype, methods$4);

Color.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('palette' in newState && !this._updatingReadonlyProperty) { throw new Error("<Color>: Cannot set read-only property 'palette'"); }
	if ('colorKeys' in newState && !this._updatingReadonlyProperty) { throw new Error("<Color>: Cannot set read-only property 'colorKeys'"); }
	if ('hexColor' in newState && !this._updatingReadonlyProperty) { throw new Error("<Color>: Cannot set read-only property 'hexColor'"); }
	if ('customColor' in newState && !this._updatingReadonlyProperty) { throw new Error("<Color>: Cannot set read-only property 'customColor'"); }
};

Color.prototype._recompute = function _recompute(changed, state) {
	if (changed.$themeData) {
		if (this._differs(state.palette, (state.palette = palette_1(state)))) { changed.palette = true; }
	}

	if (changed.$vis || changed.keys || changed.customizable || changed.axis || changed.custom || changed.palette) {
		if (this._differs(state.colorKeys, (state.colorKeys = colorKeys(state)))) { changed.colorKeys = true; }
	}

	if (changed.value || changed.palette) {
		if (this._differs(state.hexColor, (state.hexColor = hexColor(state)))) { changed.hexColor = true; }
	}

	if (changed.selected || changed.palette || changed.custom) {
		if (this._differs(state.customColor, (state.customColor = customColor(state)))) { changed.customColor = true; }
	}
};

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/CustomFormat.html generated by Svelte v1.64.0 */

function axisCol(ref) {
    var $vis = ref.$vis;
    var $dataset = ref.$dataset;
    var axis = ref.axis;

    if (!$vis || !axis) { return null; }
    var colids = $vis.axes()[axis];
    return $dataset.column(typeof colids === 'object' ? colids[0] : colids);
}
function columnType(ref) {
    var axisCol = ref.axisCol;
    var type = ref.type;

    if (axisCol) { return axisCol.type(); }
    if (type) { return type; }
    return 'number';
}
function customFormatHelp(ref) {
    var columnType = ref.columnType;
    var disabled = ref.disabled;

    if (columnType === 'date')
        { return ((disabled ? '' : '<a href="http://momentjs.com/docs/#/displaying/format/" target="_blank">') + "moment.js documentation" + (disabled ? '' : '</a>')); }
    if (columnType === 'number')
        { return ((disabled ? '' : '<a href="http://numeraljs.com/#format" target="_blank">') + "numeral.js documentation" + (disabled ? '' : '</a>')); }
    return '';
}
function options(ref) {
    var columnType = ref.columnType;

    if (columnType === 'number') {
        // todo: translate labels
        return [
            { l: '1,000[.00]', f: '0,0.[00]' },
            { l: '0', f: '0' },
            { l: '0.0', f: '0.0' },
            { l: '0.00', f: '0.00' },
            { l: '0.000', f: '0.000' },
            { l: '0.[0]', f: '0.[0]' },
            { l: '0.[00]', f: '0.[00]' },
            { l: '0%', f: '0%' },
            { l: '0.0%', f: '0.0%' },
            { l: '0.00%', f: '0.00%' },
            { l: '0.[0]%', f: '0.[0]%' },
            { l: '0.[00]%', f: '0.[00]%' },
            { l: '10,000', f: '0,0' },
            { l: '1st', f: '0o' },
            { l: '123k', f: '0a' },
            { l: '123.4k', f: '0.[0]a' },
            { l: '123.45k', f: '0.[00]a' }
        ];
    }
    if (columnType === 'date') {
        // todo translate
        return [
            { l: '2015, 2016', f: 'YYYY' },
            { l: '2015 Q1, 2015 Q2', f: 'YYYY [Q]Q' },
            { l: '2015, Q2, Q3', f: 'YYYY|[Q]Q' },
            { l: '2015, Feb, Mar', f: 'YYYY|MMM' },
            { l: '’15, ’16', f: '’YY' },
            { l: 'April, May', f: 'MMMM' },
            { l: 'Apr, May', f: 'MMM' },
            { l: 'Apr ’15, May ’15', f: 'MMM ’YY' },
            { l: 'April, 2, 3', f: 'MMM|DD' }
        ];
    }
    return [];
}
function data$7() {
    return {
        axis: false,
        value: '',
        custom: '',
        selected: null,
        type: false,
        disabled: false
    };
}
function onstate(ref) {
    var this$1 = this;
    var changed = ref.changed;
    var current = ref.current;
    var previous = ref.previous;

    // watch select input
    if (changed.selected && current.selected) {
        this.set({ value: current.selected !== 'custom' ? current.selected : current.custom + ' ' });
    }
    // watch external value changes
    if (changed.value && previous) {
        for (var i = 0, list = current.options; i < list.length; i += 1) {
            var o = list[i];

        	if (o.f === current.value) {
                this$1.set({ selected: current.value, custom: '' });
                return;
            }
        }
        this.set({ selected: 'custom', custom: current.value });
    }
    if (changed.custom && current.custom) {
        if (current.selected === 'custom') {
            this.set({ value: current.custom });
        }
    }
}
function create_main_fragment$7(component, state) {
	var text, div, select, option, text_1, select_updating = false, text_2, text_4, if_block_1_anchor, text_5;

	var each_value = state.options;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(component, assign(assign({}, state), {
			each_value: each_value,
			opt: each_value[i],
			opt_index: i
		}));
	}

	function select_change_handler() {
		select_updating = true;
		component.set({ selected: selectValue(select) });
		select_updating = false;
	}

	var if_block = (state.selected == 'custom') && create_if_block$6(component, state);

	var if_block_1 = (state.selected == 'custom') && create_if_block_1$4(component, state);

	var controlgroup_initial_data = {
	 	type: "custom-format",
	 	width: state.width||'100px',
	 	valign: "top",
	 	label: state.label,
	 	disabled: state.disabled
	 };
	var controlgroup = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_initial_data
	});

	return {
		c: function create() {
			text = createText("\n    ");
			div = createElement("div");
			select = createElement("select");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			option = createElement("option");
			text_1 = createText("(custom)");
			text_2 = createText("\n        ");
			if (if_block) { if_block.c(); }
			text_4 = createText("\n    ");
			if (if_block_1) { if_block_1.c(); }
			if_block_1_anchor = createComment();
			text_5 = createText("\n");
			controlgroup._fragment.c();
			this.h();
		},

		h: function hydrate() {
			option.__value = "custom";
			option.value = option.__value;
			addListener(select, "change", select_change_handler);
			if (!('selected' in state)) { component.root._beforecreate.push(select_change_handler); }
			select.disabled = state.disabled;
			select.className = "svelte-6348wb";
			div.className = "flex svelte-6348wb";
		},

		m: function mount(target, anchor) {
			appendNode(text, controlgroup._slotted.default);
			appendNode(div, controlgroup._slotted.default);
			appendNode(select, div);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(select, null);
			}

			appendNode(option, select);
			appendNode(text_1, option);

			selectOption(select, state.selected);

			appendNode(text_2, div);
			if (if_block) { if_block.m(div, null); }
			appendNode(text_4, controlgroup._slotted.default);
			if (if_block_1) { if_block_1.m(controlgroup._slotted.default, null); }
			appendNode(if_block_1_anchor, controlgroup._slotted.default);
			appendNode(text_5, controlgroup._slotted.default);
			controlgroup._mount(target, anchor);
		},

		p: function update(changed, state) {
			var each_value = state.options;

			if (changed.options) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						opt: each_value[i],
						opt_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$2(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(select, option);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value.length;
			}

			if (!select_updating) { selectOption(select, state.selected); }
			if (changed.disabled) {
				select.disabled = state.disabled;
			}

			if (state.selected == 'custom') {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$6(component, state);
					if_block.c();
					if_block.m(div, null);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			if (state.selected == 'custom') {
				if (if_block_1) {
					if_block_1.p(changed, state);
				} else {
					if_block_1 = create_if_block_1$4(component, state);
					if_block_1.c();
					if_block_1.m(if_block_1_anchor.parentNode, if_block_1_anchor);
				}
			} else if (if_block_1) {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = null;
			}

			var controlgroup_changes = {};
			if (changed.width) { controlgroup_changes.width = state.width||'100px'; }
			if (changed.label) { controlgroup_changes.label = state.label; }
			if (changed.disabled) { controlgroup_changes.disabled = state.disabled; }
			controlgroup._set(controlgroup_changes);
		},

		u: function unmount() {
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}

			if (if_block) { if_block.u(); }
			if (if_block_1) { if_block_1.u(); }
			controlgroup._unmount();
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			removeListener(select, "change", select_change_handler);
			if (if_block) { if_block.d(); }
			if (if_block_1) { if_block_1.d(); }
			controlgroup.destroy(false);
		}
	};
}

// (4:12) {#each options as opt}
function create_each_block$2(component, state) {
	var opt = state.opt, each_value = state.each_value, opt_index = state.opt_index;
	var option, text_value = opt.l, text, option_value_value;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			option.__value = option_value_value = opt.f;
			option.value = option.__value;
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function update(changed, state) {
			opt = state.opt;
			each_value = state.each_value;
			opt_index = state.opt_index;
			if ((changed.options) && text_value !== (text_value = opt.l)) {
				text.data = text_value;
			}

			if ((changed.options) && option_value_value !== (option_value_value = opt.f)) {
				option.__value = option_value_value;
			}

			option.value = option.__value;
		},

		u: function unmount() {
			detachNode(option);
		},

		d: noop
	};
}

// (9:8) {#if selected == 'custom'}
function create_if_block$6(component, state) {
	var input, input_updating = false;

	function input_input_handler() {
		input_updating = true;
		component.set({ custom: input.value });
		input_updating = false;
	}

	return {
		c: function create() {
			input = createElement("input");
			this.h();
		},

		h: function hydrate() {
			addListener(input, "input", input_input_handler);
			setAttribute(input, "type", "text");
			input.disabled = state.disabled;
			input.className = "svelte-6348wb";
		},

		m: function mount(target, anchor) {
			insertNode(input, target, anchor);

			input.value = state.custom;
		},

		p: function update(changed, state) {
			if (!input_updating) { input.value = state.custom; }
			if (changed.disabled) {
				input.disabled = state.disabled;
			}
		},

		u: function unmount() {
			detachNode(input);
		},

		d: function destroy$$1() {
			removeListener(input, "input", input_input_handler);
		}
	};
}

// (13:4) {#if selected == 'custom'}
function create_if_block_1$4(component, state) {
	var div, text, raw_before, raw_after, text_1;

	return {
		c: function create() {
			div = createElement("div");
			text = createText("For help on custom formats, check the ");
			raw_before = createElement('noscript');
			raw_after = createElement('noscript');
			text_1 = createText(".");
			this.h();
		},

		h: function hydrate() {
			div.className = "small svelte-6348wb";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(text, div);
			appendNode(raw_before, div);
			raw_before.insertAdjacentHTML("afterend", state.customFormatHelp);
			appendNode(raw_after, div);
			appendNode(text_1, div);
		},

		p: function update(changed, state) {
			if (changed.customFormatHelp) {
				detachBetween(raw_before, raw_after);
				raw_before.insertAdjacentHTML("afterend", state.customFormatHelp);
			}
		},

		u: function unmount() {
			detachBetween(raw_before, raw_after);

			detachNode(div);
		},

		d: noop
	};
}

function CustomFormat(options) {
	this._debugName = '<CustomFormat>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(assign(this.store._init(["vis","dataset"]), data$7()), options.data);
	this.store._add(this, ["vis","dataset"]);
	this._recompute({ $vis: 1, $dataset: 1, axis: 1, axisCol: 1, type: 1, columnType: 1, disabled: 1 }, this._state);

	if (!('disabled' in this._state)) { console.warn("<CustomFormat> was created without expected data property 'disabled'"); }

	if (!('type' in this._state)) { console.warn("<CustomFormat> was created without expected data property 'type'"); }
	if (!('$vis' in this._state)) { console.warn("<CustomFormat> was created without expected data property '$vis'"); }
	if (!('$dataset' in this._state)) { console.warn("<CustomFormat> was created without expected data property '$dataset'"); }
	if (!('axis' in this._state)) { console.warn("<CustomFormat> was created without expected data property 'axis'"); }
	if (!('width' in this._state)) { console.warn("<CustomFormat> was created without expected data property 'width'"); }
	if (!('label' in this._state)) { console.warn("<CustomFormat> was created without expected data property 'label'"); }
	if (!('selected' in this._state)) { console.warn("<CustomFormat> was created without expected data property 'selected'"); }

	if (!('custom' in this._state)) { console.warn("<CustomFormat> was created without expected data property 'custom'"); }

	this._handlers.state = [onstate];

	this._handlers.destroy = [removeFromStore];

	var self = this;
	var _oncreate = function() {
		var changed = { columnType: 1, disabled: 1, axisCol: 1, type: 1, $vis: 1, $dataset: 1, axis: 1, width: 1, label: 1, selected: 1, options: 1, custom: 1, customFormatHelp: 1 };
		onstate.call(self, { changed: changed, current: self._state });
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$7(this, this._state);

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

assign(CustomFormat.prototype, protoDev);

CustomFormat.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('axisCol' in newState && !this._updatingReadonlyProperty) { throw new Error("<CustomFormat>: Cannot set read-only property 'axisCol'"); }
	if ('columnType' in newState && !this._updatingReadonlyProperty) { throw new Error("<CustomFormat>: Cannot set read-only property 'columnType'"); }
	if ('customFormatHelp' in newState && !this._updatingReadonlyProperty) { throw new Error("<CustomFormat>: Cannot set read-only property 'customFormatHelp'"); }
	if ('options' in newState && !this._updatingReadonlyProperty) { throw new Error("<CustomFormat>: Cannot set read-only property 'options'"); }
};

CustomFormat.prototype._recompute = function _recompute(changed, state) {
	if (changed.$vis || changed.$dataset || changed.axis) {
		if (this._differs(state.axisCol, (state.axisCol = axisCol(state)))) { changed.axisCol = true; }
	}

	if (changed.axisCol || changed.type) {
		if (this._differs(state.columnType, (state.columnType = columnType(state)))) { changed.columnType = true; }
	}

	if (changed.columnType || changed.disabled) {
		if (this._differs(state.customFormatHelp, (state.customFormatHelp = customFormatHelp(state)))) { changed.customFormatHelp = true; }
	}

	if (changed.columnType) {
		if (this._differs(state.options, (state.options = options(state)))) { changed.options = true; }
	}
};

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/Dropdown.html generated by Svelte v1.64.0 */

function currentLabel(ref) {
    var value = ref.value;
    var options = ref.options;
    var placeholder = ref.placeholder;
    var forcePlaceholder = ref.forcePlaceholder;

    if (!forcePlaceholder) {
        for (var i = 0; i < options.length; i++) {
            if (options[i].value === value) { return options[i].label; }
        }
    }
    return ("<span style=\"color:#999;font-size:12px;\">" + placeholder + "</span>");
}
function data$8() {
    return {
        forcePlaceholder: false,
        disabled: false,
        width: 'auto',
        options: [],
        optgroups: [],
        placeholder: '(select an item)'
    };
}
var methods$5 = {
    select: function select(event, opt) {
        event.preventDefault();
        this.set({ value: opt.value });
        this.fire('change', opt.value);
    },
    keydown: function keydown(event) {
        if (event.key === 'ArrowDown') {
            this.moveSelection(1);
        } else if (event.key === 'ArrowUp') {
            this.moveSelection(-1);
        }
    },
    moveSelection: function moveSelection(diff) {
        var ref = this.get();
        var value = ref.value;
        var options = ref.options;
        var selIndex = options.map(function (o) { return o.value; }).indexOf(value);
        if (value < 0) { selIndex = diff > 0 ? diff : options.length + diff; }
        else { selIndex += diff; }
        var newVal = options[(selIndex + options.length) % options.length].value;
        this.set({ value: newVal });
        this.fire('change', newVal);
    }
};

function create_main_fragment$8(component, state) {
	var text, text_1, span, div, button, raw_after, text_2, span_1, text_6, span_2, ul, text_8, text_9;

	function keydown_handler(event) {
		component.keydown(event);
	}

	var if_block = (state.options.length) && create_if_block$7(component, state);

	var basedropdown_initial_data = { disabled: state.disabled };
	var basedropdown = new BaseDropdown({
		root: component.root,
		slots: { default: createFragment(), button: createFragment(), content: createFragment() },
		data: basedropdown_initial_data
	});

	var controlgroup_initial_data = {
	 	width: state.width,
	 	inline: true,
	 	label: state.label,
	 	disabled: state.disabled
	 };
	var controlgroup = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_initial_data
	});

	return {
		c: function create() {
			text = createText("\n    ");
			text_1 = createText("\n        ");
			span = createElement("span");
			div = createElement("div");
			button = createElement("button");
			raw_after = createElement('noscript');
			text_2 = createText("\n                    ");
			span_1 = createElement("span");
			text_6 = createText("\n        ");
			span_2 = createElement("span");
			ul = createElement("ul");
			if (if_block) { if_block.c(); }
			text_8 = createText("\n    ");
			basedropdown._fragment.c();
			text_9 = createText("\n");
			controlgroup._fragment.c();
			this.h();
		},

		h: function hydrate() {
			span_1.className = "caret svelte-kh5nv7";
			addListener(button, "keydown", keydown_handler);
			button.className = "btn dropdown-toggle svelte-kh5nv7";
			setAttribute(button, "class:disabled", true);
			div.className = "btn-group";
			setAttribute(span, "slot", "button");
			ul.className = "dropdown-menu svelte-kh5nv7";
			setStyle(ul, "display", "block");
			setAttribute(span_2, "slot", "content");
		},

		m: function mount(target, anchor) {
			appendNode(text, controlgroup._slotted.default);
			appendNode(text_1, basedropdown._slotted.default);
			appendNode(span, basedropdown._slotted.button);
			appendNode(div, span);
			appendNode(button, div);
			appendNode(raw_after, button);
			raw_after.insertAdjacentHTML("beforebegin", state.currentLabel);
			appendNode(text_2, button);
			appendNode(span_1, button);
			appendNode(text_6, basedropdown._slotted.default);
			appendNode(span_2, basedropdown._slotted.content);
			appendNode(ul, span_2);
			if (if_block) { if_block.m(ul, null); }
			appendNode(text_8, basedropdown._slotted.default);
			basedropdown._mount(controlgroup._slotted.default, null);
			appendNode(text_9, controlgroup._slotted.default);
			controlgroup._mount(target, anchor);
		},

		p: function update(changed, state) {
			if (changed.currentLabel) {
				detachBefore(raw_after);
				raw_after.insertAdjacentHTML("beforebegin", state.currentLabel);
			}

			if (state.options.length) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$7(component, state);
					if_block.c();
					if_block.m(ul, null);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			var basedropdown_changes = {};
			if (changed.disabled) { basedropdown_changes.disabled = state.disabled; }
			basedropdown._set(basedropdown_changes);

			var controlgroup_changes = {};
			if (changed.width) { controlgroup_changes.width = state.width; }
			controlgroup_changes.inline = true;
			if (changed.label) { controlgroup_changes.label = state.label; }
			if (changed.disabled) { controlgroup_changes.disabled = state.disabled; }
			controlgroup._set(controlgroup_changes);
		},

		u: function unmount() {
			detachBefore(raw_after);

			if (if_block) { if_block.u(); }
			controlgroup._unmount();
		},

		d: function destroy$$1() {
			removeListener(button, "keydown", keydown_handler);
			if (if_block) { if_block.d(); }
			basedropdown.destroy(false);
			controlgroup.destroy(false);
		}
	};
}

// (13:37) {#each options as opt}
function create_each_block$3(component, state) {
	var opt = state.opt, each_value = state.each_value, opt_index = state.opt_index;
	var li, a, raw_value = opt.label, a_href_value, li_class_value;

	return {
		c: function create() {
			li = createElement("li");
			a = createElement("a");
			this.h();
		},

		h: function hydrate() {
			addListener(a, "click", click_handler$2);
			a.href = a_href_value = "#/" + opt.value;

			a._svelte = {
				component: component,
				each_value: state.each_value,
				opt_index: state.opt_index
			};

			li.className = li_class_value = "" + (state.value==opt.value?'selected':'') + " svelte-kh5nv7";
		},

		m: function mount(target, anchor) {
			insertNode(li, target, anchor);
			appendNode(a, li);
			a.innerHTML = raw_value;
		},

		p: function update(changed, state) {
			opt = state.opt;
			each_value = state.each_value;
			opt_index = state.opt_index;
			if ((changed.options) && raw_value !== (raw_value = opt.label)) {
				a.innerHTML = raw_value;
			}

			if ((changed.options) && a_href_value !== (a_href_value = "#/" + opt.value)) {
				a.href = a_href_value;
			}

			a._svelte.each_value = state.each_value;
			a._svelte.opt_index = state.opt_index;

			if ((changed.value || changed.options) && li_class_value !== (li_class_value = "" + (state.value==opt.value?'selected':'') + " svelte-kh5nv7")) {
				li.className = li_class_value;
			}
		},

		u: function unmount() {
			a.innerHTML = '';

			detachNode(li);
		},

		d: function destroy$$1() {
			removeListener(a, "click", click_handler$2);
		}
	};
}

// (13:16) {#if options.length}
function create_if_block$7(component, state) {
	var each_anchor;

	var each_value = state.options;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$3(component, assign(assign({}, state), {
			each_value: each_value,
			opt: each_value[i],
			opt_index: i
		}));
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

			insertNode(each_anchor, target, anchor);
		},

		p: function update(changed, state) {
			var each_value = state.options;

			if (changed.value || changed.options) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						opt: each_value[i],
						opt_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$3(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(each_anchor.parentNode, each_anchor);
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
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}

			detachNode(each_anchor);
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);
		}
	};
}

function click_handler$2(event) {
	var component = this._svelte.component;
	var each_value = this._svelte.each_value, opt_index = this._svelte.opt_index, opt = each_value[opt_index];
	component.select(event, opt);
}

function Dropdown(options) {
	this._debugName = '<Dropdown>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data$8(), options.data);
	this._recompute({ value: 1, options: 1, placeholder: 1, forcePlaceholder: 1 }, this._state);
	if (!('value' in this._state)) { console.warn("<Dropdown> was created without expected data property 'value'"); }
	if (!('options' in this._state)) { console.warn("<Dropdown> was created without expected data property 'options'"); }
	if (!('placeholder' in this._state)) { console.warn("<Dropdown> was created without expected data property 'placeholder'"); }
	if (!('forcePlaceholder' in this._state)) { console.warn("<Dropdown> was created without expected data property 'forcePlaceholder'"); }
	if (!('width' in this._state)) { console.warn("<Dropdown> was created without expected data property 'width'"); }
	if (!('label' in this._state)) { console.warn("<Dropdown> was created without expected data property 'label'"); }
	if (!('disabled' in this._state)) { console.warn("<Dropdown> was created without expected data property 'disabled'"); }

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$8(this, this._state);

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

assign(Dropdown.prototype, protoDev);
assign(Dropdown.prototype, methods$5);

Dropdown.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('currentLabel' in newState && !this._updatingReadonlyProperty) { throw new Error("<Dropdown>: Cannot set read-only property 'currentLabel'"); }
};

Dropdown.prototype._recompute = function _recompute(changed, state) {
	if (changed.value || changed.options || changed.placeholder || changed.forcePlaceholder) {
		if (this._differs(state.currentLabel, (state.currentLabel = currentLabel(state)))) { changed.currentLabel = true; }
	}
};

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/FontStyle.html generated by Svelte v1.64.0 */

function data$9() {
    return {
        value: {
            bold: false,
            italic: false,
            underline: false,
            wide: false,
            color: '#000000',
            background: '#ffffff',
            fontSize: 13,
            colorReset: false,
            backgroundReset: false
        },
        indeterminate: {
            bold: false,
            italic: false,
            underline: false,
            wide: false,
            color: false,
            background: false,
            fontSize: false
        },
        disabled: false,
        disabled_msg: '',
        width: '80px',
        help: '',
        placeholder: '',
        underline: true,
        spacing: false,
        color: false,
        fontSize: false,
        fontSizePercent: false,
        background: false
    };
}
function oncreate() {
    // fix default value for font size
    var ref = this.get();
    var fontSizePercent = ref.fontSizePercent;
    var value = ref.value;
    if (fontSizePercent && value.fontSize === 13) {
        value.fontSize = 1;
        this.set({ value: value });
    }
}
function create_main_fragment$9(component, state) {
	var text, div, text_1, i, text_2, basetogglebutton_updating = {}, text_3, text_4, i_1, text_5, basetogglebutton_1_updating = {}, text_6, text_7, if_block_1_anchor, text_8, text_10, if_block_4_anchor, text_11;

	var basetogglebutton_initial_data = {
	 	disabled: state.disabled,
	 	indeterminate: state.indeterminate.bold
	 };
	if ('bold' in state.value) {
		basetogglebutton_initial_data.value = state.value.bold;
		basetogglebutton_updating.value = true;
	}
	var basetogglebutton = new BaseToggleButton({
		root: component.root,
		slots: { default: createFragment() },
		data: basetogglebutton_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!basetogglebutton_updating.value && changed.value) {
				state.value.bold = childState.value;
				newState.value = state.value;
			}
			component._set(newState);
			basetogglebutton_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		basetogglebutton._bind({ value: 1 }, basetogglebutton.get());
	});

	var basetogglebutton_1_initial_data = {
	 	disabled: state.disabled,
	 	indeterminate: state.indeterminate.italic
	 };
	if ('italic' in state.value) {
		basetogglebutton_1_initial_data.value = state.value.italic;
		basetogglebutton_1_updating.value = true;
	}
	var basetogglebutton_1 = new BaseToggleButton({
		root: component.root,
		slots: { default: createFragment() },
		data: basetogglebutton_1_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!basetogglebutton_1_updating.value && changed.value) {
				state.value.italic = childState.value;
				newState.value = state.value;
			}
			component._set(newState);
			basetogglebutton_1_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		basetogglebutton_1._bind({ value: 1 }, basetogglebutton_1.get());
	});

	var if_block = (state.underline) && create_if_block$8(component, state);

	var if_block_1 = (state.spacing) && create_if_block_1$5(component, state);

	var if_block_2 = (state.color) && create_if_block_2$1(component, state);

	var if_block_3 = (state.background) && create_if_block_3$1(component, state);

	var if_block_4 = (state.fontSize) && create_if_block_4$1(component, state);

	var controlgroup_initial_data = {
	 	width: state.width,
	 	type: "radio",
	 	valign: "baseline",
	 	label: state.label,
	 	disabled: state.disabled
	 };
	var controlgroup = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_initial_data
	});

	return {
		c: function create() {
			text = createText("\n    ");
			div = createElement("div");
			text_1 = createText("\n            ");
			i = createElement("i");
			text_2 = createText("\n        ");
			basetogglebutton._fragment.c();
			text_3 = createText("\n        ");
			text_4 = createText("\n            ");
			i_1 = createElement("i");
			text_5 = createText("\n        ");
			basetogglebutton_1._fragment.c();
			text_6 = createText("\n        ");
			if (if_block) { if_block.c(); }
			text_7 = createText(" ");
			if (if_block_1) { if_block_1.c(); }
			if_block_1_anchor = createComment();
			if (if_block_2) { if_block_2.c(); }
			text_8 = createText(" ");
			if (if_block_3) { if_block_3.c(); }
			text_10 = createText("\n    ");
			if (if_block_4) { if_block_4.c(); }
			if_block_4_anchor = createComment();
			text_11 = createText("\n");
			controlgroup._fragment.c();
			this.h();
		},

		h: function hydrate() {
			i.className = "fa fa-fw fa-bold";
			i_1.className = "fa fa-fw fa-italic";
			div.className = "btn-group svelte-l5q6v5 svelte-zqouky";
		},

		m: function mount(target, anchor) {
			appendNode(text, controlgroup._slotted.default);
			appendNode(div, controlgroup._slotted.default);
			appendNode(text_1, basetogglebutton._slotted.default);
			appendNode(i, basetogglebutton._slotted.default);
			appendNode(text_2, basetogglebutton._slotted.default);
			basetogglebutton._mount(div, null);
			appendNode(text_3, div);
			appendNode(text_4, basetogglebutton_1._slotted.default);
			appendNode(i_1, basetogglebutton_1._slotted.default);
			appendNode(text_5, basetogglebutton_1._slotted.default);
			basetogglebutton_1._mount(div, null);
			appendNode(text_6, div);
			if (if_block) { if_block.m(div, null); }
			appendNode(text_7, div);
			if (if_block_1) { if_block_1.m(div, null); }
			appendNode(if_block_1_anchor, div);
			if (if_block_2) { if_block_2.m(div, null); }
			appendNode(text_8, div);
			if (if_block_3) { if_block_3.m(div, null); }
			appendNode(text_10, controlgroup._slotted.default);
			if (if_block_4) { if_block_4.m(controlgroup._slotted.default, null); }
			appendNode(if_block_4_anchor, controlgroup._slotted.default);
			appendNode(text_11, controlgroup._slotted.default);
			controlgroup._mount(target, anchor);
		},

		p: function update(changed, state) {
			var basetogglebutton_changes = {};
			if (changed.disabled) { basetogglebutton_changes.disabled = state.disabled; }
			if (changed.indeterminate) { basetogglebutton_changes.indeterminate = state.indeterminate.bold; }
			if (!basetogglebutton_updating.value && changed.value) {
				basetogglebutton_changes.value = state.value.bold;
				basetogglebutton_updating.value = true;
			}
			basetogglebutton._set(basetogglebutton_changes);
			basetogglebutton_updating = {};

			var basetogglebutton_1_changes = {};
			if (changed.disabled) { basetogglebutton_1_changes.disabled = state.disabled; }
			if (changed.indeterminate) { basetogglebutton_1_changes.indeterminate = state.indeterminate.italic; }
			if (!basetogglebutton_1_updating.value && changed.value) {
				basetogglebutton_1_changes.value = state.value.italic;
				basetogglebutton_1_updating.value = true;
			}
			basetogglebutton_1._set(basetogglebutton_1_changes);
			basetogglebutton_1_updating = {};

			if (state.underline) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$8(component, state);
					if_block.c();
					if_block.m(div, text_7);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			if (state.spacing) {
				if (if_block_1) {
					if_block_1.p(changed, state);
				} else {
					if_block_1 = create_if_block_1$5(component, state);
					if_block_1.c();
					if_block_1.m(div, if_block_1_anchor);
				}
			} else if (if_block_1) {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = null;
			}

			if (state.color) {
				if (if_block_2) {
					if_block_2.p(changed, state);
				} else {
					if_block_2 = create_if_block_2$1(component, state);
					if_block_2.c();
					if_block_2.m(div, text_8);
				}
			} else if (if_block_2) {
				if_block_2.u();
				if_block_2.d();
				if_block_2 = null;
			}

			if (state.background) {
				if (if_block_3) {
					if_block_3.p(changed, state);
				} else {
					if_block_3 = create_if_block_3$1(component, state);
					if_block_3.c();
					if_block_3.m(div, null);
				}
			} else if (if_block_3) {
				if_block_3.u();
				if_block_3.d();
				if_block_3 = null;
			}

			if (state.fontSize) {
				if (if_block_4) {
					if_block_4.p(changed, state);
				} else {
					if_block_4 = create_if_block_4$1(component, state);
					if_block_4.c();
					if_block_4.m(if_block_4_anchor.parentNode, if_block_4_anchor);
				}
			} else if (if_block_4) {
				if_block_4.u();
				if_block_4.d();
				if_block_4 = null;
			}

			var controlgroup_changes = {};
			if (changed.width) { controlgroup_changes.width = state.width; }
			if (changed.label) { controlgroup_changes.label = state.label; }
			if (changed.disabled) { controlgroup_changes.disabled = state.disabled; }
			controlgroup._set(controlgroup_changes);
		},

		u: function unmount() {
			if (if_block) { if_block.u(); }
			if (if_block_1) { if_block_1.u(); }
			if (if_block_2) { if_block_2.u(); }
			if (if_block_3) { if_block_3.u(); }
			if (if_block_4) { if_block_4.u(); }
			controlgroup._unmount();
		},

		d: function destroy$$1() {
			basetogglebutton.destroy(false);
			basetogglebutton_1.destroy(false);
			if (if_block) { if_block.d(); }
			if (if_block_1) { if_block_1.d(); }
			if (if_block_2) { if_block_2.d(); }
			if (if_block_3) { if_block_3.d(); }
			if (if_block_4) { if_block_4.d(); }
			controlgroup.destroy(false);
		}
	};
}

// (9:8) {#if underline}
function create_if_block$8(component, state) {
	var text, i, text_1, basetogglebutton_updating = {};

	var basetogglebutton_initial_data = {
	 	disabled: state.disabled,
	 	indeterminate: state.indeterminate.underline
	 };
	if ('underline' in state.value) {
		basetogglebutton_initial_data.value = state.value.underline;
		basetogglebutton_updating.value = true;
	}
	var basetogglebutton = new BaseToggleButton({
		root: component.root,
		slots: { default: createFragment() },
		data: basetogglebutton_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!basetogglebutton_updating.value && changed.value) {
				state.value.underline = childState.value;
				newState.value = state.value;
			}
			component._set(newState);
			basetogglebutton_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		basetogglebutton._bind({ value: 1 }, basetogglebutton.get());
	});

	return {
		c: function create() {
			text = createText("\n            ");
			i = createElement("i");
			text_1 = createText("\n        ");
			basetogglebutton._fragment.c();
			this.h();
		},

		h: function hydrate() {
			i.className = "fa fa-fw fa-underline";
		},

		m: function mount(target, anchor) {
			appendNode(text, basetogglebutton._slotted.default);
			appendNode(i, basetogglebutton._slotted.default);
			appendNode(text_1, basetogglebutton._slotted.default);
			basetogglebutton._mount(target, anchor);
		},

		p: function update(changed, state) {
			var basetogglebutton_changes = {};
			if (changed.disabled) { basetogglebutton_changes.disabled = state.disabled; }
			if (changed.indeterminate) { basetogglebutton_changes.indeterminate = state.indeterminate.underline; }
			if (!basetogglebutton_updating.value && changed.value) {
				basetogglebutton_changes.value = state.value.underline;
				basetogglebutton_updating.value = true;
			}
			basetogglebutton._set(basetogglebutton_changes);
			basetogglebutton_updating = {};
		},

		u: function unmount() {
			basetogglebutton._unmount();
		},

		d: function destroy$$1() {
			basetogglebutton.destroy(false);
		}
	};
}

// (13:14) {#if spacing}
function create_if_block_1$5(component, state) {
	var text, i, text_1, basetogglebutton_updating = {}, text_2;

	var basetogglebutton_initial_data = {
	 	disabled: state.disabled,
	 	indeterminate: state.indeterminate.wide
	 };
	if ('wide' in state.value) {
		basetogglebutton_initial_data.value = state.value.wide;
		basetogglebutton_updating.value = true;
	}
	var basetogglebutton = new BaseToggleButton({
		root: component.root,
		slots: { default: createFragment() },
		data: basetogglebutton_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!basetogglebutton_updating.value && changed.value) {
				state.value.wide = childState.value;
				newState.value = state.value;
			}
			component._set(newState);
			basetogglebutton_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		basetogglebutton._bind({ value: 1 }, basetogglebutton.get());
	});

	return {
		c: function create() {
			text = createText("\n            ");
			i = createElement("i");
			text_1 = createText("\n        ");
			basetogglebutton._fragment.c();
			text_2 = createText("\n        ");
			this.h();
		},

		h: function hydrate() {
			i.className = "fa fa-text-width fa-fw ";
			setAttribute(i, "aria-hidden", "true");
		},

		m: function mount(target, anchor) {
			appendNode(text, basetogglebutton._slotted.default);
			appendNode(i, basetogglebutton._slotted.default);
			appendNode(text_1, basetogglebutton._slotted.default);
			basetogglebutton._mount(target, anchor);
			insertNode(text_2, target, anchor);
		},

		p: function update(changed, state) {
			var basetogglebutton_changes = {};
			if (changed.disabled) { basetogglebutton_changes.disabled = state.disabled; }
			if (changed.indeterminate) { basetogglebutton_changes.indeterminate = state.indeterminate.wide; }
			if (!basetogglebutton_updating.value && changed.value) {
				basetogglebutton_changes.value = state.value.wide;
				basetogglebutton_updating.value = true;
			}
			basetogglebutton._set(basetogglebutton_changes);
			basetogglebutton_updating = {};
		},

		u: function unmount() {
			basetogglebutton._unmount();
			detachNode(text_2);
		},

		d: function destroy$$1() {
			basetogglebutton.destroy(false);
		}
	};
}

// (17:13) {#if color}
function create_if_block_2$1(component, state) {
	var text, button, i, text_1, div, text_3, colorpicker_updating = {};

	var colorpicker_initial_data = {
	 	disabled: state.disabled,
	 	reset: state.colorReset
	 };
	if ('color' in state.value) {
		colorpicker_initial_data.color = state.value.color;
		colorpicker_updating.color = true;
	}
	var colorpicker = new ColorPicker({
		root: component.root,
		slots: { default: createFragment() },
		data: colorpicker_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!colorpicker_updating.color && changed.color) {
				state.value.color = childState.color;
				newState.value = state.value;
			}
			component._set(newState);
			colorpicker_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		colorpicker._bind({ color: 1 }, colorpicker.get());
	});

	return {
		c: function create() {
			text = createText("\n            ");
			button = createElement("button");
			i = createElement("i");
			text_1 = createText("\n                ");
			div = createElement("div");
			text_3 = createText("\n        ");
			colorpicker._fragment.c();
			this.h();
		},

		h: function hydrate() {
			i.className = "fa fa-font fa-fw svelte-zqouky";
			setAttribute(i, "aria-hidden", "true");
			div.className = "color-bar svelte-zqouky";
			setStyle(div, "background", state.value.color);
			button.disabled = state.disabled;
			button.className = "btn-color btn btn-s svelte-zqouky";
		},

		m: function mount(target, anchor) {
			appendNode(text, colorpicker._slotted.default);
			appendNode(button, colorpicker._slotted.default);
			appendNode(i, button);
			appendNode(text_1, button);
			appendNode(div, button);
			appendNode(text_3, colorpicker._slotted.default);
			colorpicker._mount(target, anchor);
		},

		p: function update(changed, state) {
			if (changed.value) {
				setStyle(div, "background", state.value.color);
			}

			if (changed.disabled) {
				button.disabled = state.disabled;
			}

			var colorpicker_changes = {};
			if (changed.disabled) { colorpicker_changes.disabled = state.disabled; }
			if (changed.colorReset) { colorpicker_changes.reset = state.colorReset; }
			if (!colorpicker_updating.color && changed.value) {
				colorpicker_changes.color = state.value.color;
				colorpicker_updating.color = true;
			}
			colorpicker._set(colorpicker_changes);
			colorpicker_updating = {};
		},

		u: function unmount() {
			colorpicker._unmount();
		},

		d: function destroy$$1() {
			colorpicker.destroy(false);
		}
	};
}

// (24:14) {#if background}
function create_if_block_3$1(component, state) {
	var text, button, i, text_1, div, text_3, colorpicker_updating = {};

	var colorpicker_initial_data = {
	 	disabled: state.disabled,
	 	reset: state.backgroundReset
	 };
	if ('background' in state.value) {
		colorpicker_initial_data.color = state.value.background;
		colorpicker_updating.color = true;
	}
	var colorpicker = new ColorPicker({
		root: component.root,
		slots: { default: createFragment() },
		data: colorpicker_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!colorpicker_updating.color && changed.color) {
				state.value.background = childState.color;
				newState.value = state.value;
			}
			component._set(newState);
			colorpicker_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		colorpicker._bind({ color: 1 }, colorpicker.get());
	});

	return {
		c: function create() {
			text = createText("\n            ");
			button = createElement("button");
			i = createElement("i");
			text_1 = createText("\n                ");
			div = createElement("div");
			text_3 = createText("\n        ");
			colorpicker._fragment.c();
			this.h();
		},

		h: function hydrate() {
			i.className = "fa fa-paint-brush fa-fw svelte-zqouky";
			setAttribute(i, "aria-hidden", "true");
			div.className = "color-bar svelte-zqouky";
			setStyle(div, "background", ( state.value.background ? state.value.background : 'transparent' ));
			button.disabled = state.disabled;
			button.className = "btn-color btn btn-s svelte-zqouky";
		},

		m: function mount(target, anchor) {
			appendNode(text, colorpicker._slotted.default);
			appendNode(button, colorpicker._slotted.default);
			appendNode(i, button);
			appendNode(text_1, button);
			appendNode(div, button);
			appendNode(text_3, colorpicker._slotted.default);
			colorpicker._mount(target, anchor);
		},

		p: function update(changed, state) {
			if (changed.value) {
				setStyle(div, "background", ( state.value.background ? state.value.background : 'transparent' ));
			}

			if (changed.disabled) {
				button.disabled = state.disabled;
			}

			var colorpicker_changes = {};
			if (changed.disabled) { colorpicker_changes.disabled = state.disabled; }
			if (changed.backgroundReset) { colorpicker_changes.reset = state.backgroundReset; }
			if (!colorpicker_updating.color && changed.value) {
				colorpicker_changes.color = state.value.background;
				colorpicker_updating.color = true;
			}
			colorpicker._set(colorpicker_changes);
			colorpicker_updating = {};
		},

		u: function unmount() {
			colorpicker._unmount();
		},

		d: function destroy$$1() {
			colorpicker.destroy(false);
		}
	};
}

// (33:4) {#if fontSize}
function create_if_block_4$1(component, state) {
	var basenumber_updating = {};

	var basenumber_initial_data = {
	 	width: state.fontSizePercent ? '43px' : '30px',
	 	slider: false,
	 	disabled: state.disabled,
	 	unit: state.fontSizePercent ? '%' : 'px',
	 	step: state.fontSizePercent ? 0.01 : 1,
	 	multiply: state.fontSizePercent ? 100 : 1,
	 	min: 0,
	 	max: state.fontSizePercent ? 5 : 50
	 };
	if ('fontSize' in state.value) {
		basenumber_initial_data.value = state.value.fontSize;
		basenumber_updating.value = true;
	}
	var basenumber = new BaseNumber({
		root: component.root,
		data: basenumber_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!basenumber_updating.value && changed.value) {
				state.value.fontSize = childState.value;
				newState.value = state.value;
			}
			component._set(newState);
			basenumber_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		basenumber._bind({ value: 1 }, basenumber.get());
	});

	return {
		c: function create() {
			basenumber._fragment.c();
		},

		m: function mount(target, anchor) {
			basenumber._mount(target, anchor);
		},

		p: function update(changed, state) {
			var basenumber_changes = {};
			if (changed.fontSizePercent) { basenumber_changes.width = state.fontSizePercent ? '43px' : '30px'; }
			basenumber_changes.slider = false;
			if (changed.disabled) { basenumber_changes.disabled = state.disabled; }
			if (changed.fontSizePercent) { basenumber_changes.unit = state.fontSizePercent ? '%' : 'px'; }
			if (changed.fontSizePercent) { basenumber_changes.step = state.fontSizePercent ? 0.01 : 1; }
			if (changed.fontSizePercent) { basenumber_changes.multiply = state.fontSizePercent ? 100 : 1; }
			if (changed.fontSizePercent) { basenumber_changes.max = state.fontSizePercent ? 5 : 50; }
			if (!basenumber_updating.value && changed.value) {
				basenumber_changes.value = state.value.fontSize;
				basenumber_updating.value = true;
			}
			basenumber._set(basenumber_changes);
			basenumber_updating = {};
		},

		u: function unmount() {
			basenumber._unmount();
		},

		d: function destroy$$1() {
			basenumber.destroy(false);
		}
	};
}

function FontStyle(options) {
	this._debugName = '<FontStyle>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data$9(), options.data);
	if (!('width' in this._state)) { console.warn("<FontStyle> was created without expected data property 'width'"); }
	if (!('label' in this._state)) { console.warn("<FontStyle> was created without expected data property 'label'"); }
	if (!('disabled' in this._state)) { console.warn("<FontStyle> was created without expected data property 'disabled'"); }
	if (!('indeterminate' in this._state)) { console.warn("<FontStyle> was created without expected data property 'indeterminate'"); }
	if (!('value' in this._state)) { console.warn("<FontStyle> was created without expected data property 'value'"); }
	if (!('underline' in this._state)) { console.warn("<FontStyle> was created without expected data property 'underline'"); }
	if (!('spacing' in this._state)) { console.warn("<FontStyle> was created without expected data property 'spacing'"); }
	if (!('color' in this._state)) { console.warn("<FontStyle> was created without expected data property 'color'"); }
	if (!('colorReset' in this._state)) { console.warn("<FontStyle> was created without expected data property 'colorReset'"); }
	if (!('background' in this._state)) { console.warn("<FontStyle> was created without expected data property 'background'"); }
	if (!('backgroundReset' in this._state)) { console.warn("<FontStyle> was created without expected data property 'backgroundReset'"); }
	if (!('fontSize' in this._state)) { console.warn("<FontStyle> was created without expected data property 'fontSize'"); }
	if (!('fontSizePercent' in this._state)) { console.warn("<FontStyle> was created without expected data property 'fontSizePercent'"); }

	var self = this;
	var _oncreate = function() {
		var changed = { width: 1, label: 1, disabled: 1, indeterminate: 1, value: 1, underline: 1, spacing: 1, color: 1, colorReset: 1, background: 1, backgroundReset: 1, fontSize: 1, fontSizePercent: 1 };
		oncreate.call(self);
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$9(this, this._state);

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

assign(FontStyle.prototype, protoDev);

FontStyle.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/Group.html generated by Svelte v1.64.0 */

function data$10() {
    return {
        notoggle: false,
        id: false,
        open: true
    };
}
var methods$6 = {
    toggle: function toggle() {
        if (this.get().notoggle) { return; }
        var ref = this.get();
        var open = ref.open;
        var id = ref.id;
        if (id) {
            var visGroups = JSON.parse(window.localStorage.getItem('dw-vis-groups')) || {};
            visGroups[id] = open ? 'closed' : 'open';
            window.localStorage.setItem('dw-vis-groups', JSON.stringify(visGroups));
        }
        this.set({ open: !open });
    }
};

function oncreate$1() {
    var ref = this.get() || {};
    var id = ref.id;
    var notoggle = ref.notoggle;
    if (notoggle) { return; }
    if (id) {
        var visGroups = JSON.parse(window.localStorage.getItem('dw-vis-groups')) || {};
        if (visGroups && visGroups[id]) {
            this.set({ open: visGroups[id] !== 'closed' });
        }
    }
}
function create_main_fragment$10(component, state) {
	var div, label, text, raw_before, text_1;

	var if_block = (!state.notoggle) && create_if_block$9(component, state);

	function click_handler(event) {
		component.toggle();
	}

	var if_block_1 = (state.open) && create_if_block_1$6(component, state);

	return {
		c: function create() {
			div = createElement("div");
			label = createElement("label");
			if (if_block) { if_block.c(); }
			text = createText(" ");
			raw_before = createElement('noscript');
			text_1 = createText("\n\n    ");
			if (if_block_1) { if_block_1.c(); }
			this.h();
		},

		h: function hydrate() {
			addListener(label, "click", click_handler);
			label.className = "group-title";
			setAttribute(div, "class:group-open", "open");
			setAttribute(div, "class:notoggle", true);
			div.className = "vis-option-type-group svelte-1dxu1tl";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(label, div);
			if (if_block) { if_block.m(label, null); }
			appendNode(text, label);
			appendNode(raw_before, label);
			raw_before.insertAdjacentHTML("afterend", state.label);
			appendNode(text_1, div);
			if (if_block_1) { if_block_1.m(div, null); }
		},

		p: function update(changed, state) {
			if (!state.notoggle) {
				if (!if_block) {
					if_block = create_if_block$9(component, state);
					if_block.c();
					if_block.m(label, text);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			if (changed.label) {
				detachAfter(raw_before);
				raw_before.insertAdjacentHTML("afterend", state.label);
			}

			if (state.open) {
				if (!if_block_1) {
					if_block_1 = create_if_block_1$6(component, state);
					if_block_1.c();
					if_block_1.m(div, null);
				}
			} else if (if_block_1) {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = null;
			}
		},

		u: function unmount() {
			detachAfter(raw_before);

			detachNode(div);
			if (if_block) { if_block.u(); }
			if (if_block_1) { if_block_1.u(); }
		},

		d: function destroy$$1() {
			if (if_block) { if_block.d(); }
			removeListener(label, "click", click_handler);
			if (if_block_1) { if_block_1.d(); }
		}
	};
}

// (3:8) {#if !notoggle}
function create_if_block$9(component, state) {
	var i, text, i_1;

	return {
		c: function create() {
			i = createElement("i");
			text = createText("\n        ");
			i_1 = createElement("i");
			this.h();
		},

		h: function hydrate() {
			i.className = "fa fa-chevron-up expand-group pull-right";
			i_1.className = "fa fa-chevron-down collapse-group pull-right";
		},

		m: function mount(target, anchor) {
			insertNode(i, target, anchor);
			insertNode(text, target, anchor);
			insertNode(i_1, target, anchor);
		},

		u: function unmount() {
			detachNode(i);
			detachNode(text);
			detachNode(i_1);
		},

		d: noop
	};
}

// (9:4) {#if open}
function create_if_block_1$6(component, state) {
	var div, slot_content_default = component._slotted.default, text;

	return {
		c: function create() {
			div = createElement("div");
			if (!slot_content_default) {
				text = createText("content");
			}
			this.h();
		},

		h: function hydrate() {
			div.className = "option-group-content vis-option-type-chart-description";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			if (!slot_content_default) {
				appendNode(text, div);
			}

			else {
				appendNode(slot_content_default, div);
			}
		},

		u: function unmount() {
			detachNode(div);

			if (slot_content_default) {
				reinsertChildren(div, slot_content_default);
			}
		},

		d: noop
	};
}

function Group(options) {
	this._debugName = '<Group>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data$10(), options.data);
	if (!('notoggle' in this._state)) { console.warn("<Group> was created without expected data property 'notoggle'"); }
	if (!('label' in this._state)) { console.warn("<Group> was created without expected data property 'label'"); }
	if (!('open' in this._state)) { console.warn("<Group> was created without expected data property 'open'"); }

	this._slotted = options.slots || {};

	var self = this;
	var _oncreate = function() {
		var changed = { notoggle: 1, label: 1, open: 1 };
		oncreate$1.call(self);
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
	}

	this.slots = {};

	this._fragment = create_main_fragment$10(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._oncreate);
	}
}

assign(Group.prototype, protoDev);
assign(Group.prototype, methods$6);

Group.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/Help.html generated by Svelte v1.64.0 */

function data$11() {
    return {
        visible: false
    };
}
var methods$7 = {
    show: function show() {
        var this$1 = this;

        var t = setTimeout(function () {
            this$1.set({ visible: true });
        }, 400);
        this.set({ t: t });
    },
    hide: function hide() {
        var ref = this.get();
        var t = ref.t;
        clearTimeout(t);
        this.set({ visible: false });
    }
};

function create_main_fragment$11(component, state) {
	var div, span, text;

	function select_block_type(state) {
		if (state.visible) { return create_if_block$10; }
		return create_if_block_1$7;
	}

	var current_block_type = select_block_type(state);
	var if_block = current_block_type(component, state);

	var if_block_1 = (state.visible) && create_if_block_2$2(component, state);

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
			if_block.c();
			text = createText("\n    ");
			if (if_block_1) { if_block_1.c(); }
			this.h();
		},

		h: function hydrate() {
			span.className = "svelte-1efx6hn";
			addListener(div, "mouseenter", mouseenter_handler);
			addListener(div, "mouseleave", mouseleave_handler);
			div.className = "help svelte-1efx6hn";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(span, div);
			if_block.m(span, null);
			appendNode(text, div);
			if (if_block_1) { if_block_1.m(div, null); }
		},

		p: function update(changed, state) {
			if (current_block_type !== (current_block_type = select_block_type(state))) {
				if_block.u();
				if_block.d();
				if_block = current_block_type(component, state);
				if_block.c();
				if_block.m(span, null);
			}

			if (state.visible) {
				if (!if_block_1) {
					if_block_1 = create_if_block_2$2(component, state);
					if_block_1.c();
					if_block_1.m(div, null);
				}
			} else if (if_block_1) {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = null;
			}
		},

		u: function unmount() {
			detachNode(div);
			if_block.u();
			if (if_block_1) { if_block_1.u(); }
		},

		d: function destroy$$1() {
			if_block.d();
			if (if_block_1) { if_block_1.d(); }
			removeListener(div, "mouseenter", mouseenter_handler);
			removeListener(div, "mouseleave", mouseleave_handler);
		}
	};
}

// (2:10) {#if visible}
function create_if_block$10(component, state) {
	var i;

	return {
		c: function create() {
			i = createElement("i");
			this.h();
		},

		h: function hydrate() {
			i.className = "im im-graduation-hat svelte-1efx6hn";
		},

		m: function mount(target, anchor) {
			insertNode(i, target, anchor);
		},

		u: function unmount() {
			detachNode(i);
		},

		d: noop
	};
}

// (2:59) {:else}
function create_if_block_1$7(component, state) {
	var text;

	return {
		c: function create() {
			text = createText("?");
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

// (3:4) {#if visible}
function create_if_block_2$2(component, state) {
	var div, slot_content_default = component._slotted.default;

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div.className = "content svelte-1efx6hn";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);

			if (slot_content_default) {
				appendNode(slot_content_default, div);
			}
		},

		u: function unmount() {
			detachNode(div);

			if (slot_content_default) {
				reinsertChildren(div, slot_content_default);
			}
		},

		d: noop
	};
}

function Help(options) {
	this._debugName = '<Help>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data$11(), options.data);
	if (!('visible' in this._state)) { console.warn("<Help> was created without expected data property 'visible'"); }

	this._slotted = options.slots || {};

	this.slots = {};

	this._fragment = create_main_fragment$11(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(Help.prototype, protoDev);
assign(Help.prototype, methods$7);

Help.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/ListItem.html generated by Svelte v1.64.0 */

function create_main_fragment$12(component, state) {
	var div, raw_value = state.item.name || state.item.label || state.item.id;

	return {
		c: function create() {
			div = createElement("div");
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			div.innerHTML = raw_value;
		},

		p: function update(changed, state) {
			if ((changed.item) && raw_value !== (raw_value = state.item.name || state.item.label || state.item.id)) {
				div.innerHTML = raw_value;
			}
		},

		u: function unmount() {
			div.innerHTML = '';

			detachNode(div);
		},

		d: noop
	};
}

function ListItem(options) {
	this._debugName = '<ListItem>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign({}, options.data);
	if (!('item' in this._state)) { console.warn("<ListItem> was created without expected data property 'item'"); }

	this._fragment = create_main_fragment$12(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(ListItem.prototype, protoDev);

ListItem.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/List.html generated by Svelte v1.64.0 */

function data$12() {
    return {
        items: [],
        itemRenderer: ListItem,
        selected: [],
        selectable: true,
        draggable: false,
        compact: false,
        multiselectable: true,
        // internal state
        dragging: false,
        dragtarget: -1,
        dropafter: false,
        disabled: false
    };
}
var methods$8 = {
    select: function select(event, item, index) {
        var ref = this.get();
        var multiselectable = ref.multiselectable;
        var selectable = ref.selectable;
        var disabled = ref.disabled;
        if (!selectable || disabled) { return; }
        event.stopPropagation();
        // if (event.__ignoreSelect) return;
        if (multiselectable && event.shiftKey) {
            // shift-select for selecting ranges
            return this.selectShift(event, item);
        }
        if (multiselectable && (event.ctrlKey || event.metaKey)) {
            // ctrl-select for multi-selection
            return this.selectCtrl(event, item);
        }
        // normal single item selection
        this.selectNormal(event, item);
    },

    /*
     * the normal selection unselects the previously selected
     * item and selects the new one
     */
    selectNormal: function selectNormal(event, item) {
        var ref = this.get();
        var selected = ref.selected;
        var isSelected = selected.length === 0 && item.id === selected[0];
        if (isSelected) {
            selected.length = 0;
        } else {
            selected.length = 1;
            selected[0] = item.id;
        }
        this.set({
            selected: selected
        });
    },

    /*
     * multiple selection using control key toggles the
     * selection status for each item indiviually
     */
    selectCtrl: function selectCtrl(event, item) {
        var ref = this.get();
        var selected = ref.selected;
        // check if item is already in selection
        var pos = selected.indexOf(item.id);
        if (pos > -1) {
            // item is already in selection, so let's remove it
            selected.splice(pos, 1);
        } else {
            // item is not in selection, let's add it
            selected.push(item.id);
        }
        // save selection
        this.set({ selected: selected });
    },

    /*
     * multi-selection using shift key selects everything between
     * the first selected item and the last selected item
     */
    selectShift: function selectShift(event, item) {
        var ref = this.get();
        var selected = ref.selected;
        var items = ref.items;
        // shift --> select range
        var itemIds = items.map(function (m) { return m.id; });

        if (selected.length === 1) {
            // find index of activeItem
            var activeIndex = itemIds.indexOf(selected[0]);
            if (activeIndex > -1) {
                // find index of the newly selected item
                var newIndex = items.indexOf(item);
                if (newIndex > -1) {
                    // now select everything between the two items
                    selected.length = 0;
                    selected.push.apply(selected, itemIds.slice(Math.min(newIndex, activeIndex), Math.max(newIndex, activeIndex) + 1));
                }
            }
        } else if (selected.length > 1) {
            // extend selection either down or up
            var selMin = itemIds.indexOf(selected[0]);
            var selMax = itemIds.indexOf(selected[selected.length - 1]);
            var newIndex$1 = items.indexOf(item);

            if (Math.abs(newIndex$1 - selMin) < Math.abs(newIndex$1 - selMax)) {
                // new index is closer to lower end
                selMin = newIndex$1;
            } else {
                selMax = newIndex$1;
            }

            // now select everything between the two items
            selected.length = 0;
            selected.push.apply(selected, itemIds.slice(selMin, selMax + 1));
        }
        // save selection
        this.set({ selected: selected });
    },

    dragstart: function dragstart(ev, itemIndex) {
        var ref = this.get();
        var draggable = ref.draggable;
        var items = ref.items;
        var selected = ref.selected;
        var disabled = ref.disabled;
        if (!draggable || disabled) { return; }
        selected.length = 1;
        selected[0] = items[itemIndex].id;
        // store the item to the drag event data
        ev.dataTransfer.setData('item', itemIndex);
        this.set({ dragging: true, selected: selected });
    },

    dragover: function dragover(ev) {
        var ref = this.get();
        var draggable = ref.draggable;
        var disabled = ref.disabled;
        if (!draggable || disabled) { return; }
        var li = ev.target;
        var target = li.parentElement === this.refs.list ? +li.getAttribute('data-pos') : -1;
        var liBbox = li.getBoundingClientRect();
        var y = (ev.clientY - liBbox.top) / liBbox.height;

        this.set({
            dragtarget: target,
            dropafter: y > 0.5
        });
        ev.dataTransfer.dropEffect = 'move';
    },

    drop: function drop(ev) {
        var ref = this.get();
        var draggable = ref.draggable;
        var disabled = ref.disabled;
        if (!draggable || disabled) { return; }
        var i = ev.dataTransfer.getData('item');
        // const ds = this.store.dataset();
        var ref$1 = this.get();
        var dragtarget = ref$1.dragtarget;
        var dropafter = ref$1.dropafter;
        var items = ref$1.items;
        if (i !== dragtarget) {
            var tgt = items[dragtarget];
            var item = items.splice(i, 1)[0];
            var newTargetPos = items.indexOf(tgt);
            if (!newTargetPos && !dropafter) {
                // move to beginning of list
                items.unshift(item);
            } else {
                items.splice(newTargetPos + (dropafter ? 1 : 0), 0, item);
            }
        }

        this.set({
            dragging: false,
            dragtarget: -1,
            items: items
        });
        this.fire('itemDrag', { items: items });
    }
};

function create_main_fragment$13(component, state) {
	var ul;

	var each_value = state.items;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$4(component, assign(assign({}, state), {
			each_value: each_value,
			item: each_value[i],
			index: i
		}));
	}

	function drop_preventDefault_handler(event) {
		component.drop(event);
	}

	function dragover_preventDefault_handler(event) {
		component.dragover(event);
	}

	return {
		c: function create() {
			ul = createElement("ul");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			this.h();
		},

		h: function hydrate() {
			addListener(ul, "drop|preventDefault", drop_preventDefault_handler);
			addListener(ul, "dragover|preventDefault", dragover_preventDefault_handler);
			ul.className = "unstyled svelte-d0p0x8";
			setAttribute(ul, "class:disabled", true);
			setAttribute(ul, "class:dragging", "dragging");
			setAttribute(ul, "class:compact", "compact");
		},

		m: function mount(target, anchor) {
			insertNode(ul, target, anchor);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(ul, null);
			}

			component.refs.list = ul;
		},

		p: function update(changed, state) {
			var each_value = state.items;

			if (changed.draggable || changed.items) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						item: each_value[i],
						index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$4(component, each_context);
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
			detachNode(ul);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			removeListener(ul, "drop|preventDefault", drop_preventDefault_handler);
			removeListener(ul, "dragover|preventDefault", dragover_preventDefault_handler);
			if (component.refs.list === ul) { component.refs.list = null; }
		}
	};
}

// (10:4) {#each items as item, index}
function create_each_block$4(component, state) {
	var item = state.item, each_value = state.each_value, index = state.index;
	var li, a, switch_instance_updating = {}, a_href_value;

	var switch_value = state.itemRenderer;

	function switch_props(state) {
		var switch_instance_initial_data = {};
		if (index in state.each_value) {
			switch_instance_initial_data.item = item ;
			switch_instance_updating.item = true;
		}
		return {
			root: component.root,
			data: switch_instance_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
				if (!switch_instance_updating.item && changed.item) {
					each_value[index] = childState.item;

					newState.items = state.items;
				}
				component._set(newState);
				switch_instance_updating = {};
			}
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(state));

		component.root._beforecreate.push(function() {
			switch_instance._bind({ item: 1 }, switch_instance.get());
		});
	}

	return {
		c: function create() {
			li = createElement("li");
			a = createElement("a");
			if (switch_instance) { switch_instance._fragment.c(); }
			this.h();
		},

		h: function hydrate() {
			addListener(a, "click|preventDefault", click_preventDefault_handler);
			a.href = a_href_value = "#item-" + index;
			a.className = "svelte-d0p0x8";

			a._svelte = {
				component: component,
				each_value: state.each_value,
				index: state.index
			};

			addListener(li, "dragstart", dragstart_handler);
			addListener(li, "click|preventDefault", click_preventDefault_handler_1);
			setAttribute(li, "class:selected", "selected.indexOf(item.id ) > -1");
			setAttribute(li, "class:dragtarget", "dragtarget === index");
			setAttribute(li, "class:dropafter", "dropafter");
			setAttribute(li, "class:dropbefore", "!dropafter");
			li.dataset.pos = index;
			li.draggable = state.draggable;
			li.className = "svelte-d0p0x8";

			li._svelte = {
				component: component,
				each_value: state.each_value,
				index: state.index
			};
		},

		m: function mount(target, anchor) {
			insertNode(li, target, anchor);
			appendNode(a, li);

			if (switch_instance) {
				switch_instance._mount(a, null);
			}
		},

		p: function update(changed, state) {
			item = state.item;
			each_value = state.each_value;
			index = state.index;
			if (switch_value !== (switch_value = state.itemRenderer)) {
				if (switch_instance) { switch_instance.destroy(); }

				if (switch_value) {
					switch_instance = new switch_value(switch_props(state));
					switch_instance._fragment.c();
					switch_instance._mount(a, null);
				}
			}

			else {
				var switch_instance_changes = {};
				if (!switch_instance_updating.item && changed.items) {
					switch_instance_changes.item = item ;
					switch_instance_updating.item = true;
				}
				switch_instance._set(switch_instance_changes);
				switch_instance_updating = {};
			}

			a._svelte.each_value = state.each_value;
			a._svelte.index = state.index;

			if (changed.draggable) {
				li.draggable = state.draggable;
			}

			li._svelte.each_value = state.each_value;
			li._svelte.index = state.index;
		},

		u: function unmount() {
			detachNode(li);
		},

		d: function destroy$$1() {
			if (switch_instance) { switch_instance.destroy(false); }
			removeListener(a, "click|preventDefault", click_preventDefault_handler);
			removeListener(li, "dragstart", dragstart_handler);
			removeListener(li, "click|preventDefault", click_preventDefault_handler_1);
		}
	};
}

function click_preventDefault_handler(event) {
	var component = this._svelte.component;
	var each_value = this._svelte.each_value, index = this._svelte.index, item = each_value[index];
	component.select(event, item, index);
}

function dragstart_handler(event) {
	var component = this._svelte.component;
	var each_value = this._svelte.each_value, index = this._svelte.index, item = each_value[index];
	component.dragstart(event, index);
}

function click_preventDefault_handler_1(event) {
	var component = this._svelte.component;
	var each_value = this._svelte.each_value, index = this._svelte.index, item = each_value[index];
	component.select(event, item, index);
}

function List(options) {
	this._debugName = '<List>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this.refs = {};
	this._state = assign(data$12(), options.data);
	if (!('items' in this._state)) { console.warn("<List> was created without expected data property 'items'"); }
	if (!('draggable' in this._state)) { console.warn("<List> was created without expected data property 'draggable'"); }
	if (!('itemRenderer' in this._state)) { console.warn("<List> was created without expected data property 'itemRenderer'"); }

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$13(this, this._state);

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

assign(List.prototype, protoDev);
assign(List.prototype, methods$8);

List.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/Number.html generated by Svelte v1.64.0 */

function data$13() {
    return {
        width: '100px',
        multiply: 1,
        unit: '',
        slider: true,
        min: 0,
        max: 100,
        disabled: false,
        step: 1
    };
}
function create_main_fragment$14(component, state) {
	var text, basenumber_updating = {}, text_1, controlgroup_updating = {};

	var basenumber_initial_data = {
	 	disabled: state.disabled,
	 	unit: state.unit,
	 	multiply: state.multiply,
	 	step: state.step,
	 	min: state.min,
	 	max: state.max,
	 	slider: state.slider
	 };
	if ('value' in state) {
		basenumber_initial_data.value = state.value
        ;
		basenumber_updating.value = true;
	}
	var basenumber = new BaseNumber({
		root: component.root,
		data: basenumber_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!basenumber_updating.value && changed.value) {
				newState.value = childState.value;
			}
			component._set(newState);
			basenumber_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		basenumber._bind({ value: 1 }, basenumber.get());
	});

	component.refs.baseNumber = basenumber;

	var controlgroup_initial_data = {
	 	disabled: state.disabled,
	 	type: "number",
	 	label: state.label,
	 	valign: "middle"
	 };
	if ('width' in state) {
		controlgroup_initial_data.width = state.width ;
		controlgroup_updating.width = true;
	}
	var controlgroup = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!controlgroup_updating.width && changed.width) {
				newState.width = childState.width;
			}
			component._set(newState);
			controlgroup_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		controlgroup._bind({ width: 1 }, controlgroup.get());
	});

	return {
		c: function create() {
			text = createText("\n    ");
			basenumber._fragment.c();
			text_1 = createText("\n");
			controlgroup._fragment.c();
		},

		m: function mount(target, anchor) {
			appendNode(text, controlgroup._slotted.default);
			basenumber._mount(controlgroup._slotted.default, null);
			appendNode(text_1, controlgroup._slotted.default);
			controlgroup._mount(target, anchor);
		},

		p: function update(changed, state) {
			var basenumber_changes = {};
			if (changed.disabled) { basenumber_changes.disabled = state.disabled; }
			if (changed.unit) { basenumber_changes.unit = state.unit; }
			if (changed.multiply) { basenumber_changes.multiply = state.multiply; }
			if (changed.step) { basenumber_changes.step = state.step; }
			if (changed.min) { basenumber_changes.min = state.min; }
			if (changed.max) { basenumber_changes.max = state.max; }
			if (changed.slider) { basenumber_changes.slider = state.slider; }
			if (!basenumber_updating.value && changed.value) {
				basenumber_changes.value = state.value
        ;
				basenumber_updating.value = true;
			}
			basenumber._set(basenumber_changes);
			basenumber_updating = {};

			var controlgroup_changes = {};
			if (changed.disabled) { controlgroup_changes.disabled = state.disabled; }
			if (changed.label) { controlgroup_changes.label = state.label; }
			if (!controlgroup_updating.width && changed.width) {
				controlgroup_changes.width = state.width ;
				controlgroup_updating.width = true;
			}
			controlgroup._set(controlgroup_changes);
			controlgroup_updating = {};
		},

		u: function unmount() {
			controlgroup._unmount();
		},

		d: function destroy$$1() {
			basenumber.destroy(false);
			if (component.refs.baseNumber === basenumber) { component.refs.baseNumber = null; }
			controlgroup.destroy(false);
		}
	};
}

function Number$1(options) {
	this._debugName = '<Number>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this.refs = {};
	this._state = assign(data$13(), options.data);
	if (!('disabled' in this._state)) { console.warn("<Number> was created without expected data property 'disabled'"); }
	if (!('width' in this._state)) { console.warn("<Number> was created without expected data property 'width'"); }
	if (!('label' in this._state)) { console.warn("<Number> was created without expected data property 'label'"); }
	if (!('value' in this._state)) { console.warn("<Number> was created without expected data property 'value'"); }
	if (!('unit' in this._state)) { console.warn("<Number> was created without expected data property 'unit'"); }
	if (!('multiply' in this._state)) { console.warn("<Number> was created without expected data property 'multiply'"); }
	if (!('step' in this._state)) { console.warn("<Number> was created without expected data property 'step'"); }
	if (!('min' in this._state)) { console.warn("<Number> was created without expected data property 'min'"); }
	if (!('max' in this._state)) { console.warn("<Number> was created without expected data property 'max'"); }
	if (!('slider' in this._state)) { console.warn("<Number> was created without expected data property 'slider'"); }

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$14(this, this._state);

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

assign(Number$1.prototype, protoDev);

Number$1.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/Radio.html generated by Svelte v1.64.0 */

function data$14() {
    return {
        value: null,
        disabled: false,
        indeterminate: false,
        width: 'auto',
        valign: 'top',
        inline: true
    };
}
function onstate$1(ref) {
    var changed = ref.changed;
    var previous = ref.previous;

    if (previous && changed.value) {
        this.set({ indeterminate: false });
    }
}
function create_main_fragment$15(component, state) {
	var text, div, text_2;

	var each_value = state.options;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$5(component, assign(assign({}, state), {
			each_value: each_value,
			opt: each_value[i],
			opt_index: i
		}));
	}

	var controlgroup_initial_data = {
	 	width: state.width,
	 	type: "radio",
	 	valign: "top",
	 	label: state.label,
	 	disabled: state.disabled
	 };
	var controlgroup = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_initial_data
	});

	return {
		c: function create() {
			text = createText("\n    ");
			div = createElement("div");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			text_2 = createText("\n");
			controlgroup._fragment.c();
			this.h();
		},

		h: function hydrate() {
			setAttribute(div, "class:inline", true);
			setAttribute(div, "class:indeterminate", true);
		},

		m: function mount(target, anchor) {
			appendNode(text, controlgroup._slotted.default);
			appendNode(div, controlgroup._slotted.default);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			appendNode(text_2, controlgroup._slotted.default);
			controlgroup._mount(target, anchor);
		},

		p: function update(changed, state) {
			var each_value = state.options;

			if (changed.options || changed.value || changed.disabled) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						opt: each_value[i],
						opt_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$5(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value.length;
			}

			var controlgroup_changes = {};
			if (changed.width) { controlgroup_changes.width = state.width; }
			if (changed.label) { controlgroup_changes.label = state.label; }
			if (changed.disabled) { controlgroup_changes.disabled = state.disabled; }
			controlgroup._set(controlgroup_changes);
		},

		u: function unmount() {
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}

			controlgroup._unmount();
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			controlgroup.destroy(false);
		}
	};
}

// (3:8) {#each options as opt}
function create_each_block$5(component, state) {
	var opt = state.opt, each_value = state.each_value, opt_index = state.opt_index;
	var label, input, input_value_value, span, text, span_1, text_1_value = opt.label, text_1, text_2, label_title_value;

	function input_change_handler() {
		component.set({ value: input.__value });
	}

	var if_block = (opt.help) && create_if_block$11(component, state);

	return {
		c: function create() {
			label = createElement("label");
			input = createElement("input");
			span = createElement("span");
			text = createText(" ");
			span_1 = createElement("span");
			text_1 = createText(text_1_value);
			text_2 = createText("\n            ");
			if (if_block) { if_block.c(); }
			this.h();
		},

		h: function hydrate() {
			component._bindingGroups[0].push(input);
			addListener(input, "change", input_change_handler);
			setAttribute(input, "type", "radio");
			input.__value = input_value_value = opt.value;
			input.value = input.__value;
			input.disabled = state.disabled;
			input.className = "svelte-10ew9ci";
			span.className = "css-ui svelte-10ew9ci";
			label.title = label_title_value = opt.tooltip||'';
			setAttribute(label, "class:disabled", true);
			setAttribute(label, "class:has-help", "opt.help");
			label.className = "svelte-10ew9ci";
		},

		m: function mount(target, anchor) {
			insertNode(label, target, anchor);
			appendNode(input, label);

			input.checked = input.__value === state.value;

			appendNode(span, label);
			appendNode(text, label);
			appendNode(span_1, label);
			appendNode(text_1, span_1);
			appendNode(text_2, label);
			if (if_block) { if_block.m(label, null); }
		},

		p: function update(changed, state) {
			opt = state.opt;
			each_value = state.each_value;
			opt_index = state.opt_index;
			input.checked = input.__value === state.value;
			if ((changed.options) && input_value_value !== (input_value_value = opt.value)) {
				input.__value = input_value_value;
			}

			input.value = input.__value;
			if (changed.disabled) {
				input.disabled = state.disabled;
			}

			if ((changed.options) && text_1_value !== (text_1_value = opt.label)) {
				text_1.data = text_1_value;
			}

			if (opt.help) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$11(component, state);
					if_block.c();
					if_block.m(label, null);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			if ((changed.options) && label_title_value !== (label_title_value = opt.tooltip||'')) {
				label.title = label_title_value;
			}
		},

		u: function unmount() {
			detachNode(label);
			if (if_block) { if_block.u(); }
		},

		d: function destroy$$1() {
			component._bindingGroups[0].splice(component._bindingGroups[0].indexOf(input), 1);
			removeListener(input, "change", input_change_handler);
			if (if_block) { if_block.d(); }
		}
	};
}

// (8:12) {#if opt.help}
function create_if_block$11(component, state) {
	var opt = state.opt, each_value = state.each_value, opt_index = state.opt_index;
	var div, raw_value = opt.help;

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div.className = "help svelte-10ew9ci";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			div.innerHTML = raw_value;
		},

		p: function update(changed, state) {
			opt = state.opt;
			each_value = state.each_value;
			opt_index = state.opt_index;
			if ((changed.options) && raw_value !== (raw_value = opt.help)) {
				div.innerHTML = raw_value;
			}
		},

		u: function unmount() {
			div.innerHTML = '';

			detachNode(div);
		},

		d: noop
	};
}

function Radio(options) {
	this._debugName = '<Radio>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data$14(), options.data);
	if (!('width' in this._state)) { console.warn("<Radio> was created without expected data property 'width'"); }
	if (!('label' in this._state)) { console.warn("<Radio> was created without expected data property 'label'"); }
	if (!('disabled' in this._state)) { console.warn("<Radio> was created without expected data property 'disabled'"); }
	if (!('options' in this._state)) { console.warn("<Radio> was created without expected data property 'options'"); }
	if (!('value' in this._state)) { console.warn("<Radio> was created without expected data property 'value'"); }
	this._bindingGroups = [[]];

	this._handlers.state = [onstate$1];

	var self = this;
	var _oncreate = function() {
		var changed = { width: 1, label: 1, disabled: 1, options: 1, value: 1 };
		onstate$1.call(self, { changed: changed, current: self._state });
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$15(this, this._state);

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

assign(Radio.prototype, protoDev);

Radio.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/Section.html generated by Svelte v1.64.0 */

function create_main_fragment$16(component, state) {
	var if_block_anchor;

	var if_block = (state.id==state.active) && create_if_block$12(component, state);

	return {
		c: function create() {
			if (if_block) { if_block.c(); }
			if_block_anchor = createComment();
		},

		m: function mount(target, anchor) {
			if (if_block) { if_block.m(target, anchor); }
			insertNode(if_block_anchor, target, anchor);
		},

		p: function update(changed, state) {
			if (state.id==state.active) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$12(component, state);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}
		},

		u: function unmount() {
			if (if_block) { if_block.u(); }
			detachNode(if_block_anchor);
		},

		d: function destroy$$1() {
			if (if_block) { if_block.d(); }
		}
	};
}

// (1:0) {#if id==active}
function create_if_block$12(component, state) {
	var div, fieldset, div_1, slot_content_default = component._slotted.default, div_class_value;

	return {
		c: function create() {
			div = createElement("div");
			fieldset = createElement("fieldset");
			div_1 = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div_1.className = "control-group vis-option-group";
			fieldset.id = "visOptions";
			div.className = div_class_value = "section " + state.id;
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(fieldset, div);
			appendNode(div_1, fieldset);

			if (slot_content_default) {
				appendNode(slot_content_default, div_1);
			}
		},

		p: function update(changed, state) {
			if ((changed.id) && div_class_value !== (div_class_value = "section " + state.id)) {
				div.className = div_class_value;
			}
		},

		u: function unmount() {
			detachNode(div);

			if (slot_content_default) {
				reinsertChildren(div_1, slot_content_default);
			}
		},

		d: noop
	};
}

function Section(options) {
	this._debugName = '<Section>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign({}, options.data);
	if (!('id' in this._state)) { console.warn("<Section> was created without expected data property 'id'"); }
	if (!('active' in this._state)) { console.warn("<Section> was created without expected data property 'active'"); }

	this._slotted = options.slots || {};

	this.slots = {};

	this._fragment = create_main_fragment$16(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(Section.prototype, protoDev);

Section.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/Select.html generated by Svelte v1.64.0 */

function data$15() {
    return {
        disabled: false,
        width: 'auto',
        labelWidth: 'auto',
        options: [],
        optgroups: []
    };
}
function create_main_fragment$17(component, state) {
	var text, select, if_block_anchor, select_updating = false, text_1;

	var if_block = (state.options.length) && create_if_block$13(component, state);

	var if_block_1 = (state.optgroups.length) && create_if_block_1$8(component, state);

	function select_change_handler() {
		select_updating = true;
		component.set({ value: selectValue(select) });
		select_updating = false;
	}

	var controlgroup_initial_data = {
	 	type: "select",
	 	width: state.labelWidth,
	 	valign: "baseline",
	 	inline: true,
	 	label: state.label,
	 	disabled: state.disabled
	 };
	var controlgroup = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_initial_data
	});

	return {
		c: function create() {
			text = createText("\n    ");
			select = createElement("select");
			if (if_block) { if_block.c(); }
			if_block_anchor = createComment();
			if (if_block_1) { if_block_1.c(); }
			text_1 = createText("\n");
			controlgroup._fragment.c();
			this.h();
		},

		h: function hydrate() {
			addListener(select, "change", select_change_handler);
			if (!('value' in state)) { component.root._beforecreate.push(select_change_handler); }
			select.disabled = state.disabled;
			setStyle(select, "width", state.width);
		},

		m: function mount(target, anchor) {
			appendNode(text, controlgroup._slotted.default);
			appendNode(select, controlgroup._slotted.default);
			if (if_block) { if_block.m(select, null); }
			appendNode(if_block_anchor, select);
			if (if_block_1) { if_block_1.m(select, null); }

			selectOption(select, state.value);

			appendNode(text_1, controlgroup._slotted.default);
			controlgroup._mount(target, anchor);
		},

		p: function update(changed, state) {
			if (state.options.length) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$13(component, state);
					if_block.c();
					if_block.m(select, if_block_anchor);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			if (state.optgroups.length) {
				if (if_block_1) {
					if_block_1.p(changed, state);
				} else {
					if_block_1 = create_if_block_1$8(component, state);
					if_block_1.c();
					if_block_1.m(select, null);
				}
			} else if (if_block_1) {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = null;
			}

			if (!select_updating) { selectOption(select, state.value); }
			if (changed.disabled) {
				select.disabled = state.disabled;
			}

			if (changed.width) {
				setStyle(select, "width", state.width);
			}

			var controlgroup_changes = {};
			if (changed.labelWidth) { controlgroup_changes.width = state.labelWidth; }
			controlgroup_changes.inline = true;
			if (changed.label) { controlgroup_changes.label = state.label; }
			if (changed.disabled) { controlgroup_changes.disabled = state.disabled; }
			controlgroup._set(controlgroup_changes);
		},

		u: function unmount() {
			if (if_block) { if_block.u(); }
			if (if_block_1) { if_block_1.u(); }
			controlgroup._unmount();
		},

		d: function destroy$$1() {
			if (if_block) { if_block.d(); }
			if (if_block_1) { if_block_1.d(); }
			removeListener(select, "change", select_change_handler);
			controlgroup.destroy(false);
		}
	};
}

// (3:29) {#each options as opt}
function create_each_block$6(component, state) {
	var opt = state.opt, each_value = state.each_value, opt_index = state.opt_index;
	var option, text_value = opt.label, text, option_value_value;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			option.__value = option_value_value = opt.value;
			option.value = option.__value;
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function update(changed, state) {
			opt = state.opt;
			each_value = state.each_value;
			opt_index = state.opt_index;
			if ((changed.options) && text_value !== (text_value = opt.label)) {
				text.data = text_value;
			}

			if ((changed.options) && option_value_value !== (option_value_value = opt.value)) {
				option.__value = option_value_value;
			}

			option.value = option.__value;
		},

		u: function unmount() {
			detachNode(option);
		},

		d: noop
	};
}

// (3:8) {#if options.length}
function create_if_block$13(component, state) {
	var each_anchor;

	var each_value = state.options;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$6(component, assign(assign({}, state), {
			each_value: each_value,
			opt: each_value[i],
			opt_index: i
		}));
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

			insertNode(each_anchor, target, anchor);
		},

		p: function update(changed, state) {
			var each_value = state.options;

			if (changed.options) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						opt: each_value[i],
						opt_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$6(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(each_anchor.parentNode, each_anchor);
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
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}

			detachNode(each_anchor);
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);
		}
	};
}

// (5:45) {#each optgroups as optgroup}
function create_each_block_1$1(component, state) {
	var optgroup = state.optgroup, each_value_1 = state.each_value_1, optgroup_index = state.optgroup_index;
	var optgroup_1, optgroup_1_label_value;

	var each_value_2 = optgroup.options;

	var each_blocks = [];

	for (var i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2$1(component, assign(assign({}, state), {
			each_value_2: each_value_2,
			opt: each_value_2[i],
			opt_index_1: i
		}));
	}

	return {
		c: function create() {
			optgroup_1 = createElement("optgroup");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			this.h();
		},

		h: function hydrate() {
			setAttribute(optgroup_1, "label", optgroup_1_label_value = optgroup.label);
		},

		m: function mount(target, anchor) {
			insertNode(optgroup_1, target, anchor);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(optgroup_1, null);
			}
		},

		p: function update(changed, state) {
			optgroup = state.optgroup;
			each_value_1 = state.each_value_1;
			optgroup_index = state.optgroup_index;
			var each_value_2 = optgroup.options;

			if (changed.optgroups) {
				for (var i = 0; i < each_value_2.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value_2: each_value_2,
						opt: each_value_2[i],
						opt_index_1: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block_2$1(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(optgroup_1, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value_2.length;
			}

			if ((changed.optgroups) && optgroup_1_label_value !== (optgroup_1_label_value = optgroup.label)) {
				setAttribute(optgroup_1, "label", optgroup_1_label_value);
			}
		},

		u: function unmount() {
			detachNode(optgroup_1);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);
		}
	};
}

// (7:12) {#each optgroup.options as opt}
function create_each_block_2$1(component, state) {
	var optgroup = state.optgroup, each_value_1 = state.each_value_1, optgroup_index = state.optgroup_index, opt = state.opt, each_value_2 = state.each_value_2, opt_index_1 = state.opt_index_1;
	var option, text_value = opt.label, text, option_value_value;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			option.__value = option_value_value = opt.value;
			option.value = option.__value;
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function update(changed, state) {
			optgroup = state.optgroup;
			each_value_1 = state.each_value_1;
			optgroup_index = state.optgroup_index;
			opt = state.opt;
			each_value_2 = state.each_value_2;
			opt_index_1 = state.opt_index_1;
			if ((changed.optgroups) && text_value !== (text_value = opt.label)) {
				text.data = text_value;
			}

			if ((changed.optgroups) && option_value_value !== (option_value_value = opt.value)) {
				option.__value = option_value_value;
			}

			option.value = option.__value;
		},

		u: function unmount() {
			detachNode(option);
		},

		d: noop
	};
}

// (5:22) {#if optgroups.length}
function create_if_block_1$8(component, state) {
	var each_anchor;

	var each_value_1 = state.optgroups;

	var each_blocks = [];

	for (var i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1$1(component, assign(assign({}, state), {
			each_value_1: each_value_1,
			optgroup: each_value_1[i],
			optgroup_index: i
		}));
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

			insertNode(each_anchor, target, anchor);
		},

		p: function update(changed, state) {
			var each_value_1 = state.optgroups;

			if (changed.optgroups) {
				for (var i = 0; i < each_value_1.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value_1: each_value_1,
						optgroup: each_value_1[i],
						optgroup_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block_1$1(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(each_anchor.parentNode, each_anchor);
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
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}

			detachNode(each_anchor);
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);
		}
	};
}

function Select(options) {
	this._debugName = '<Select>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data$15(), options.data);
	if (!('labelWidth' in this._state)) { console.warn("<Select> was created without expected data property 'labelWidth'"); }
	if (!('label' in this._state)) { console.warn("<Select> was created without expected data property 'label'"); }
	if (!('disabled' in this._state)) { console.warn("<Select> was created without expected data property 'disabled'"); }
	if (!('value' in this._state)) { console.warn("<Select> was created without expected data property 'value'"); }
	if (!('width' in this._state)) { console.warn("<Select> was created without expected data property 'width'"); }
	if (!('options' in this._state)) { console.warn("<Select> was created without expected data property 'options'"); }
	if (!('optgroups' in this._state)) { console.warn("<Select> was created without expected data property 'optgroups'"); }

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$17(this, this._state);

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

assign(Select.prototype, protoDev);

Select.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

function clone(o) {
    if (!o || typeof o !== 'object') { return o; }
    try {
        return JSON.parse(JSON.stringify(o));
    } catch (e) {
        return o;
    }
}

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/SelectAxisColumn.html generated by Svelte v1.64.0 */

function columns(ref) {
    var axis = ref.axis;
    var $visualization = ref.$visualization;
    var $dataset = ref.$dataset;

    var columns = [];
    // const axisMeta =
    if (!$dataset || !$visualization || !axis) { return []; }
    $dataset.eachColumn(function (column) {
        if ($visualization.axes[axis].accepts.indexOf(column.type()) > -1) {
            columns.push({
                name: column.name()
            });
        }
    });
    return columns;
}
function data$16() {
    return {
        selected: false,
        width: '200px',
        valign: 'baseline'
    };
}
function oncreate$2() {
    var this$1 = this;

    this.store.on('state', function (ref) {
        var current = ref.current;
        var changed = ref.changed;

        if (changed.visualization) {
            if (!this$1.get) { return; }
            var state = this$1.get();
            if (!state) { return; }

            // initialize if state is not yet set
            if (!state.selected && current.visualization) {
                var selected = this$1.store.getMetadata('axes', {})[this$1.get().axis];
                this$1.set({ selected: selected });
            }
        }
    });
}
function onstate$2(ref) {
    var changed = ref.changed;
    var current = ref.current;

    if (changed.selected) {
        if (current.selected) {
            var ref$1 = this.get();
            var axis = ref$1.axis;
            var axes = clone(this.store.getMetadata('axes', {}));
            if (current.selected === '-') { delete axes[axis]; }
            else { axes[axis] = current.selected; }
            this.store.setMetadata('axes', axes);
        }
    }
}
function create_main_fragment$18(component, state) {
	var text, select, if_block_anchor, select_updating = false, text_1;

	var if_block = (state.$visualization && state.$visualization.axes[state.axis].optional) && create_if_block$14(component, state);

	var each_value = state.columns;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$7(component, assign(assign({}, state), {
			each_value: each_value,
			column: each_value[i],
			column_index: i
		}));
	}

	function select_change_handler() {
		select_updating = true;
		component.set({ selected: selectValue(select) });
		select_updating = false;
	}

	var controlgroup_initial_data = {
	 	width: state.width,
	 	valign: state.valign,
	 	label: state.label
	 };
	var controlgroup = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_initial_data
	});

	return {
		c: function create() {
			text = createText("\n    ");
			select = createElement("select");
			if (if_block) { if_block.c(); }
			if_block_anchor = createComment();

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			text_1 = createText("\n");
			controlgroup._fragment.c();
			this.h();
		},

		h: function hydrate() {
			addListener(select, "change", select_change_handler);
			if (!('selected' in state)) { component.root._beforecreate.push(select_change_handler); }
			setStyle(select, "width", "calc(100% - 50px)");
		},

		m: function mount(target, anchor) {
			appendNode(text, controlgroup._slotted.default);
			appendNode(select, controlgroup._slotted.default);
			if (if_block) { if_block.m(select, null); }
			appendNode(if_block_anchor, select);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(select, null);
			}

			selectOption(select, state.selected);

			appendNode(text_1, controlgroup._slotted.default);
			controlgroup._mount(target, anchor);
		},

		p: function update(changed, state) {
			if (state.$visualization && state.$visualization.axes[state.axis].optional) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$14(component, state);
					if_block.c();
					if_block.m(select, if_block_anchor);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			var each_value = state.columns;

			if (changed.columns) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						column: each_value[i],
						column_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$7(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value.length;
			}

			if (!select_updating) { selectOption(select, state.selected); }

			var controlgroup_changes = {};
			if (changed.width) { controlgroup_changes.width = state.width; }
			if (changed.valign) { controlgroup_changes.valign = state.valign; }
			if (changed.label) { controlgroup_changes.label = state.label; }
			controlgroup._set(controlgroup_changes);
		},

		u: function unmount() {
			if (if_block) { if_block.u(); }

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}

			controlgroup._unmount();
		},

		d: function destroy$$1() {
			if (if_block) { if_block.d(); }

			destroyEach(each_blocks);

			removeListener(select, "change", select_change_handler);
			controlgroup.destroy(false);
		}
	};
}

// (3:8) {#if $visualization && $visualization.axes[axis].optional}
function create_if_block$14(component, state) {
	var option, text_value = state.axis['na-label']||'--', text;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			option.__value = "-";
			option.value = option.__value;
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function update(changed, state) {
			if ((changed.axis) && text_value !== (text_value = state.axis['na-label']||'--')) {
				text.data = text_value;
			}
		},

		u: function unmount() {
			detachNode(option);
		},

		d: noop
	};
}

// (5:14) {#each columns as column}
function create_each_block$7(component, state) {
	var column = state.column, each_value = state.each_value, column_index = state.column_index;
	var option, text_value = column.name, text, option_value_value;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			option.__value = option_value_value = column.name;
			option.value = option.__value;
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function update(changed, state) {
			column = state.column;
			each_value = state.each_value;
			column_index = state.column_index;
			if ((changed.columns) && text_value !== (text_value = column.name)) {
				text.data = text_value;
			}

			if ((changed.columns) && option_value_value !== (option_value_value = column.name)) {
				option.__value = option_value_value;
			}

			option.value = option.__value;
		},

		u: function unmount() {
			detachNode(option);
		},

		d: noop
	};
}

function SelectAxisColumn(options) {
	this._debugName = '<SelectAxisColumn>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(assign(this.store._init(["visualization","dataset"]), data$16()), options.data);
	this.store._add(this, ["visualization","dataset"]);
	this._recompute({ axis: 1, $visualization: 1, $dataset: 1 }, this._state);
	if (!('axis' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property 'axis'"); }
	if (!('$visualization' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property '$visualization'"); }
	if (!('$dataset' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property '$dataset'"); }
	if (!('width' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property 'width'"); }
	if (!('valign' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property 'valign'"); }
	if (!('label' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property 'label'"); }
	if (!('selected' in this._state)) { console.warn("<SelectAxisColumn> was created without expected data property 'selected'"); }

	this._handlers.state = [onstate$2];

	this._handlers.destroy = [removeFromStore];

	var self = this;
	var _oncreate = function() {
		var changed = { axis: 1, $visualization: 1, $dataset: 1, width: 1, valign: 1, label: 1, selected: 1, columns: 1 };
		onstate$2.call(self, { changed: changed, current: self._state });
		oncreate$2.call(self);
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$18(this, this._state);

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

assign(SelectAxisColumn.prototype, protoDev);

SelectAxisColumn.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('columns' in newState && !this._updatingReadonlyProperty) { throw new Error("<SelectAxisColumn>: Cannot set read-only property 'columns'"); }
};

SelectAxisColumn.prototype._recompute = function _recompute(changed, state) {
	if (changed.axis || changed.$visualization || changed.$dataset) {
		if (this._differs(state.columns, (state.columns = columns(state)))) { changed.columns = true; }
	}
};

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/SelectButtons.html generated by Svelte v1.64.0 */

function data$17() {
    return {
        disabled: false,
        width: 'auto',
        value: 'red',
        options: [],
        optgroups: []
    };
}
var methods$9 = {
    select: function select(option) {
        this.set({ value: option.value });
    }
};

function create_main_fragment$19(component, state) {
	var text, div, text_2, slot_content_default = component._slotted.default, text_3;

	var each_value = state.options;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$8(component, assign(assign({}, state), {
			each_value: each_value,
			option: each_value[i],
			option_index: i
		}));
	}

	var controlgroup_initial_data = {
	 	type: "select",
	 	width: state.width,
	 	valign: "middle",
	 	inline: true,
	 	label: state.label,
	 	disabled: state.disabled
	 };
	var controlgroup = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_initial_data
	});

	return {
		c: function create() {
			text = createText("\n    ");
			div = createElement("div");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			text_2 = createText("\n    ");
			text_3 = createText("\n");
			controlgroup._fragment.c();
			this.h();
		},

		h: function hydrate() {
			div.className = "btn-group svelte-l5q6v5";
		},

		m: function mount(target, anchor) {
			appendNode(text, controlgroup._slotted.default);
			appendNode(div, controlgroup._slotted.default);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			appendNode(text_2, controlgroup._slotted.default);

			if (slot_content_default) {
				appendNode(slot_content_default, controlgroup._slotted.default);
			}

			appendNode(text_3, controlgroup._slotted.default);
			controlgroup._mount(target, anchor);
		},

		p: function update(changed, state) {
			var each_value = state.options;

			if (changed.disabled || changed.options || changed.value) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						option: each_value[i],
						option_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$8(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value.length;
			}

			var controlgroup_changes = {};
			if (changed.width) { controlgroup_changes.width = state.width; }
			controlgroup_changes.inline = true;
			if (changed.label) { controlgroup_changes.label = state.label; }
			if (changed.disabled) { controlgroup_changes.disabled = state.disabled; }
			controlgroup._set(controlgroup_changes);
		},

		u: function unmount() {
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}

			if (slot_content_default) {
				reinsertChildren(controlgroup._slotted.default, slot_content_default);
			}

			controlgroup._unmount();
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			controlgroup.destroy(false);
		}
	};
}

// (3:8) {#each options as option}
function create_each_block$8(component, state) {
	var option = state.option, each_value = state.each_value, option_index = state.option_index;
	var text, if_block_anchor, text_1, if_block_1_anchor, text_2;

	var if_block = (option.label) && create_if_block$15(component, state);

	var if_block_1 = (option.svg) && create_if_block_1$9(component, state);

	var basetogglebutton_initial_data = {
	 	notoggle: 1,
	 	disabled: state.disabled,
	 	value: state.value === option.value
	 };
	var basetogglebutton = new BaseToggleButton({
		root: component.root,
		slots: { default: createFragment() },
		data: basetogglebutton_initial_data
	});

	basetogglebutton.on("select", function(event) {
		component.select(option);
	});

	return {
		c: function create() {
			text = createText("\n            ");
			if (if_block) { if_block.c(); }
			if_block_anchor = createComment();
			text_1 = createText(" ");
			if (if_block_1) { if_block_1.c(); }
			if_block_1_anchor = createComment();
			text_2 = createText("\n        ");
			basetogglebutton._fragment.c();
		},

		m: function mount(target, anchor) {
			appendNode(text, basetogglebutton._slotted.default);
			if (if_block) { if_block.m(basetogglebutton._slotted.default, null); }
			appendNode(if_block_anchor, basetogglebutton._slotted.default);
			appendNode(text_1, basetogglebutton._slotted.default);
			if (if_block_1) { if_block_1.m(basetogglebutton._slotted.default, null); }
			appendNode(if_block_1_anchor, basetogglebutton._slotted.default);
			appendNode(text_2, basetogglebutton._slotted.default);
			basetogglebutton._mount(target, anchor);
		},

		p: function update(changed, state) {
			option = state.option;
			each_value = state.each_value;
			option_index = state.option_index;
			if (option.label) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$15(component, state);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			if (option.svg) {
				if (if_block_1) {
					if_block_1.p(changed, state);
				} else {
					if_block_1 = create_if_block_1$9(component, state);
					if_block_1.c();
					if_block_1.m(if_block_1_anchor.parentNode, if_block_1_anchor);
				}
			} else if (if_block_1) {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = null;
			}

			var basetogglebutton_changes = {};
			if (changed.disabled) { basetogglebutton_changes.disabled = state.disabled; }
			if (changed.value || changed.options) { basetogglebutton_changes.value = state.value === option.value; }
			basetogglebutton._set(basetogglebutton_changes);
		},

		u: function unmount() {
			if (if_block) { if_block.u(); }
			if (if_block_1) { if_block_1.u(); }
			basetogglebutton._unmount();
		},

		d: function destroy$$1() {
			if (if_block) { if_block.d(); }
			if (if_block_1) { if_block_1.d(); }
			basetogglebutton.destroy(false);
		}
	};
}

// (5:12) {#if option.label}
function create_if_block$15(component, state) {
	var option = state.option, each_value = state.each_value, option_index = state.option_index;
	var span, raw_value = option.label;

	return {
		c: function create() {
			span = createElement("span");
		},

		m: function mount(target, anchor) {
			insertNode(span, target, anchor);
			span.innerHTML = raw_value;
		},

		p: function update(changed, state) {
			option = state.option;
			each_value = state.each_value;
			option_index = state.option_index;
			if ((changed.options) && raw_value !== (raw_value = option.label)) {
				span.innerHTML = raw_value;
			}
		},

		u: function unmount() {
			span.innerHTML = '';

			detachNode(span);
		},

		d: noop
	};
}

// (7:18) {#if option.svg}
function create_if_block_1$9(component, state) {
	var option = state.option, each_value = state.each_value, option_index = state.option_index;
	var svg, path, path_d_value;

	return {
		c: function create() {
			svg = createSvgElement("svg");
			path = createSvgElement("path");
			this.h();
		},

		h: function hydrate() {
			setAttribute(path, "class:stroke", "option.stroke");
			setStyle(path, "stroke-width", ( option.stroke || 0 ));
			setAttribute(path, "class:crisp", "option.crisp");
			setAttribute(path, "class:selected", "value === option.value");
			setAttribute(path, "d", path_d_value = option.svg);
			setAttribute(path, "class", "svelte-glvnmn");
			setAttribute(svg, "height", "16");
			setAttribute(svg, "viewBox", "0 0 24 24");
			setAttribute(svg, "xmlns", "http://www.w3.org/2000/svg");
			setAttribute(svg, "fill-rule", "evenodd");
			setAttribute(svg, "clip-rule", "evenodd");
			setAttribute(svg, "class", "svelte-glvnmn");
		},

		m: function mount(target, anchor) {
			insertNode(svg, target, anchor);
			appendNode(path, svg);
		},

		p: function update(changed, state) {
			option = state.option;
			each_value = state.each_value;
			option_index = state.option_index;
			if (changed.options) {
				setStyle(path, "stroke-width", ( option.stroke || 0 ));
			}

			if ((changed.options) && path_d_value !== (path_d_value = option.svg)) {
				setAttribute(path, "d", path_d_value);
			}
		},

		u: function unmount() {
			detachNode(svg);
		},

		d: noop
	};
}

function SelectButtons(options) {
	this._debugName = '<SelectButtons>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data$17(), options.data);
	if (!('width' in this._state)) { console.warn("<SelectButtons> was created without expected data property 'width'"); }
	if (!('label' in this._state)) { console.warn("<SelectButtons> was created without expected data property 'label'"); }
	if (!('disabled' in this._state)) { console.warn("<SelectButtons> was created without expected data property 'disabled'"); }
	if (!('options' in this._state)) { console.warn("<SelectButtons> was created without expected data property 'options'"); }
	if (!('value' in this._state)) { console.warn("<SelectButtons> was created without expected data property 'value'"); }

	this._slotted = options.slots || {};

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this.slots = {};

	this._fragment = create_main_fragment$19(this, this._state);

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

assign(SelectButtons.prototype, protoDev);
assign(SelectButtons.prototype, methods$9);

SelectButtons.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/Switch.html generated by Svelte v1.64.0 */

function data$18() {
    return {
        value: false,
        hasHelp: false,
        disabled_msg: '',
        disabled_state: 'auto',
        disabled: false,
        highlight: false,
        indeterminate: false
    };
}
var methods$10 = {
    toggle: function toggle() {
        var ref = this.get();
        var disabled = ref.disabled;
        var indeterminate = ref.indeterminate;
        if (disabled) { return; }
        this.set({ value: indeterminate ? true : !this.get().value, indeterminate: false });
    }
};

function oncreate$3() {
    this.set({
        hasHelp: this.options && this.options.slots ? !!this.options.slots.help : false
    });
}
function onstate$3(ref) {
    var this$1 = this;
    var changed = ref.changed;
    var current = ref.current;
    var previous = ref.previous;

    if (changed.value && current.value) {
        this.set({ highlight: true });
        setTimeout(function () {
            this$1.set({ highlight: false });
        }, 300);
    }
}
function create_main_fragment$20(component, state) {
	var div, text, label, button, input, input_class_value, span, text_2, raw_before, label_class_value, text_4, current_block_type_index, if_block_1;

	var if_block = (state.hasHelp) && create_if_block$16(component, state);

	function input_change_handler() {
		component.set({ value: input.checked, indeterminate: input.indeterminate });
	}

	function click_handler(event) {
		component.toggle();
	}

	var if_block_creators = [
		create_if_block_1$10,
		create_if_block_2$3 ];

	var if_blocks = [];

	function select_block_type(state) {
		if (state.disabled && state.disabled_msg) { return 0; }
		if ((!state.disabled || state.disabled_state == 'on') && state.value && !state.indeterminate) { return 1; }
		return -1;
	}

	if (~(current_block_type_index = select_block_type(state))) {
		if_block_1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, state);
	}

	return {
		c: function create() {
			div = createElement("div");
			if (if_block) { if_block.c(); }
			text = createText("\n    ");
			label = createElement("label");
			button = createElement("button");
			input = createElement("input");
			span = createElement("span");
			text_2 = createText("\n        ");
			raw_before = createElement('noscript');
			text_4 = createText("\n    ");
			if (if_block_1) { if_block_1.c(); }
			this.h();
		},

		h: function hydrate() {
			addListener(input, "change", input_change_handler);
			if (!('value' in state && 'indeterminate' in state)) { component.root._beforecreate.push(input_change_handler); }
			input.className = input_class_value = "" + (state.disabled && state.disabled_state == 'on' ? 'disabled-force-checked' : state.disabled && state.disabled_state == 'off' ? 'disabled-force-unchecked' : '') + " svelte-f43ms8";
			input.disabled = state.disabled;
			setAttribute(input, "type", "checkbox");
			span.className = "slider round svelte-f43ms8";
			addListener(button, "click", click_handler);
			button.className = "switch svelte-f43ms8";
			label.className = label_class_value = "switch-outer " + (state.disabled? 'disabled' :'') + " svelte-f43ms8";
			setStyle(label, "padding-left", "40px");
			setAttribute(div, "class:highlight", true);
			div.className = "control-group vis-option-group vis-option-type-switch svelte-f43ms8";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			if (if_block) { if_block.m(div, null); }
			appendNode(text, div);
			appendNode(label, div);
			appendNode(button, label);
			appendNode(input, button);

			input.checked = state.value;
			input.indeterminate = state.indeterminate
                ;

			appendNode(span, button);
			appendNode(text_2, label);
			appendNode(raw_before, label);
			raw_before.insertAdjacentHTML("afterend", state.label);
			appendNode(text_4, div);
			if (~current_block_type_index) { if_blocks[current_block_type_index].i(div, null); }
		},

		p: function update(changed, state) {
			if (state.hasHelp) {
				if (!if_block) {
					if_block = create_if_block$16(component, state);
					if_block.c();
					if_block.m(div, text);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			input.checked = state.value;
			input.indeterminate = state.indeterminate
                ;
			if ((changed.disabled || changed.disabled_state) && input_class_value !== (input_class_value = "" + (state.disabled && state.disabled_state == 'on' ? 'disabled-force-checked' : state.disabled && state.disabled_state == 'off' ? 'disabled-force-unchecked' : '') + " svelte-f43ms8")) {
				input.className = input_class_value;
			}

			if (changed.disabled) {
				input.disabled = state.disabled;
			}

			if (changed.label) {
				detachAfter(raw_before);
				raw_before.insertAdjacentHTML("afterend", state.label);
			}

			if ((changed.disabled) && label_class_value !== (label_class_value = "switch-outer " + (state.disabled? 'disabled' :'') + " svelte-f43ms8")) {
				label.className = label_class_value;
			}

			var previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(state);
			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) { if_blocks[current_block_type_index].p(changed, state); }
			} else {
				if (if_block_1) {
					if_block_1.o(function() {
						if_blocks[ previous_block_index ].u();
						if_blocks[ previous_block_index ].d();
						if_blocks[ previous_block_index ] = null;
					});
				}

				if (~current_block_type_index) {
					if_block_1 = if_blocks[current_block_type_index];
					if (!if_block_1) {
						if_block_1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, state);
						if_block_1.c();
					}
					if_block_1.i(div, null);
				} else {
					if_block_1 = null;
				}
			}
		},

		u: function unmount() {
			detachAfter(raw_before);

			detachNode(div);
			if (if_block) { if_block.u(); }
		},

		d: function destroy$$1() {
			if (if_block) { if_block.d(); }
			removeListener(input, "change", input_change_handler);
			removeListener(button, "click", click_handler);
			if (~current_block_type_index) {
				if_blocks[current_block_type_index].u();
				if_blocks[current_block_type_index].d();
			}
		}
	};
}

// (2:4) {#if hasHelp}
function create_if_block$16(component, state) {
	var text, slot_content_help = component._slotted.help, text_1;

	var help = new Help({
		root: component.root,
		slots: { default: createFragment() }
	});

	return {
		c: function create() {
			text = createText("\n        ");
			text_1 = createText("\n    ");
			help._fragment.c();
		},

		m: function mount(target, anchor) {
			appendNode(text, help._slotted.default);

			if (slot_content_help) {
				appendNode(slot_content_help, help._slotted.default);
			}

			appendNode(text_1, help._slotted.default);
			help._mount(target, anchor);
		},

		u: function unmount() {
			if (slot_content_help) {
				reinsertChildren(help._slotted.default, slot_content_help);
			}

			help._unmount();
		},

		d: function destroy$$1() {
			help.destroy(false);
		}
	};
}

// (19:4) {#if disabled && disabled_msg}
function create_if_block_1$10(component, state) {
	var div, div_1, div_transition, introing, outroing;

	return {
		c: function create() {
			div = createElement("div");
			div_1 = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div_1.className = "disabled-msg svelte-f43ms8";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(div_1, div);
			div_1.innerHTML = state.disabled_msg;
		},

		p: function update(changed, state) {
			if (outroing || changed.disabled_msg) {
				div_1.innerHTML = state.disabled_msg;
			}
		},

		i: function intro(target, anchor) {
			if (introing) { return; }
			introing = true;
			outroing = false;

			component.root._aftercreate.push(function() {
				if (!div_transition) { div_transition = wrapTransition(component, div, slide, {}, true, null); }
				div_transition.run(true, function() {
					component.fire("intro.end", { node: div });
				});
			});

			this.m(target, anchor);
		},

		o: function outro(outrocallback) {
			if (outroing) { return; }
			outroing = true;
			introing = false;

			var outros = 1;

			div_transition.run(false, function() {
				component.fire("outro.end", { node: div });
				if (--outros === 0) { outrocallback(); }
				div_transition = null;
			});
		},

		u: function unmount() {
			div_1.innerHTML = '';

			detachNode(div);
		},

		d: noop
	};
}

// (25:12) {#if (!disabled || disabled_state == 'on') && value && !indeterminate}
function create_if_block_2$3(component, state) {
	var div, div_1, slot_content_default = component._slotted.default, div_transition, introing, outroing;

	return {
		c: function create() {
			div = createElement("div");
			div_1 = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div_1.className = "switch-content svelte-f43ms8";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(div_1, div);

			if (slot_content_default) {
				appendNode(slot_content_default, div_1);
			}
		},

		p: noop,

		i: function intro(target, anchor) {
			if (introing) { return; }
			introing = true;
			outroing = false;

			component.root._aftercreate.push(function() {
				if (!div_transition) { div_transition = wrapTransition(component, div, slide, {}, true, null); }
				div_transition.run(true, function() {
					component.fire("intro.end", { node: div });
				});
			});

			this.m(target, anchor);
		},

		o: function outro(outrocallback) {
			if (outroing) { return; }
			outroing = true;
			introing = false;

			var outros = 1;

			div_transition.run(false, function() {
				component.fire("outro.end", { node: div });
				if (--outros === 0) { outrocallback(); }
				div_transition = null;
			});
		},

		u: function unmount() {
			detachNode(div);

			if (slot_content_default) {
				reinsertChildren(div_1, slot_content_default);
			}
		},

		d: noop
	};
}

function Switch(options) {
	this._debugName = '<Switch>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data$18(), options.data);
	if (!('hasHelp' in this._state)) { console.warn("<Switch> was created without expected data property 'hasHelp'"); }
	if (!('disabled' in this._state)) { console.warn("<Switch> was created without expected data property 'disabled'"); }
	if (!('disabled_state' in this._state)) { console.warn("<Switch> was created without expected data property 'disabled_state'"); }
	if (!('value' in this._state)) { console.warn("<Switch> was created without expected data property 'value'"); }
	if (!('indeterminate' in this._state)) { console.warn("<Switch> was created without expected data property 'indeterminate'"); }
	if (!('label' in this._state)) { console.warn("<Switch> was created without expected data property 'label'"); }
	if (!('disabled_msg' in this._state)) { console.warn("<Switch> was created without expected data property 'disabled_msg'"); }

	this._handlers.state = [onstate$3];

	this._slotted = options.slots || {};

	var self = this;
	var _oncreate = function() {
		var changed = { hasHelp: 1, disabled: 1, disabled_state: 1, value: 1, indeterminate: 1, label: 1, disabled_msg: 1 };
		onstate$3.call(self, { changed: changed, current: self._state });
		oncreate$3.call(self);
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this.slots = {};

	this._fragment = create_main_fragment$20(this, this._state);

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

assign(Switch.prototype, protoDev);
assign(Switch.prototype, methods$10);

Switch.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/Text.html generated by Svelte v1.64.0 */

function data$19() {
    return {
        disabled: false,
        disabled_msg: '',
        width: '100px',
        help: '',
        placeholder: ''
    };
}
function create_main_fragment$21(component, state) {
	var text, input, input_updating = false, text_1, text_2, if_block_anchor;

	function input_input_handler() {
		input_updating = true;
		component.set({ value: input.value });
		input_updating = false;
	}

	var controlgroup_initial_data = {
	 	disabled: state.disabled,
	 	type: "text",
	 	width: state.width,
	 	label: state.label,
	 	help: state.help
	 };
	var controlgroup = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_initial_data
	});

	var if_block = (state.disabled && state.disabled_msg) && create_if_block$17(component, state);

	return {
		c: function create() {
			text = createText("\n    ");
			input = createElement("input");
			text_1 = createText("\n");
			controlgroup._fragment.c();
			text_2 = createText("\n\n");
			if (if_block) { if_block.c(); }
			if_block_anchor = createComment();
			this.h();
		},

		h: function hydrate() {
			addListener(input, "input", input_input_handler);
			input.disabled = state.disabled;
			setAttribute(input, "type", "text");
			input.className = "input-large svelte-1qnxtfn";
			input.placeholder = state.placeholder;
		},

		m: function mount(target, anchor) {
			appendNode(text, controlgroup._slotted.default);
			appendNode(input, controlgroup._slotted.default);

			input.value = state.value ;

			appendNode(text_1, controlgroup._slotted.default);
			controlgroup._mount(target, anchor);
			insertNode(text_2, target, anchor);
			if (if_block) { if_block.i(target, anchor); }
			insertNode(if_block_anchor, target, anchor);
		},

		p: function update(changed, state) {
			if (!input_updating) { input.value = state.value ; }
			if (changed.disabled) {
				input.disabled = state.disabled;
			}

			if (changed.placeholder) {
				input.placeholder = state.placeholder;
			}

			var controlgroup_changes = {};
			if (changed.disabled) { controlgroup_changes.disabled = state.disabled; }
			if (changed.width) { controlgroup_changes.width = state.width; }
			if (changed.label) { controlgroup_changes.label = state.label; }
			if (changed.help) { controlgroup_changes.help = state.help; }
			controlgroup._set(controlgroup_changes);

			if (state.disabled && state.disabled_msg) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$17(component, state);
					if (if_block) { if_block.c(); }
				}

				if_block.i(if_block_anchor.parentNode, if_block_anchor);
			} else if (if_block) {
				if_block.o(function() {
					if_block.u();
					if_block.d();
					if_block = null;
				});
			}
		},

		u: function unmount() {
			controlgroup._unmount();
			detachNode(text_2);
			if (if_block) { if_block.u(); }
			detachNode(if_block_anchor);
		},

		d: function destroy$$1() {
			removeListener(input, "input", input_input_handler);
			controlgroup.destroy(false);
			if (if_block) { if_block.d(); }
		}
	};
}

// (5:0) {#if disabled && disabled_msg}
function create_if_block$17(component, state) {
	var div, div_1, div_transition, introing, outroing;

	return {
		c: function create() {
			div = createElement("div");
			div_1 = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div_1.className = "disabled-msg svelte-1qnxtfn";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(div_1, div);
			div_1.innerHTML = state.disabled_msg;
		},

		p: function update(changed, state) {
			if (outroing || changed.disabled_msg) {
				div_1.innerHTML = state.disabled_msg;
			}
		},

		i: function intro(target, anchor) {
			if (introing) { return; }
			introing = true;
			outroing = false;

			component.root._aftercreate.push(function() {
				if (!div_transition) { div_transition = wrapTransition(component, div, slide, {}, true, null); }
				div_transition.run(true, function() {
					component.fire("intro.end", { node: div });
				});
			});

			this.m(target, anchor);
		},

		o: function outro(outrocallback) {
			if (outroing) { return; }
			outroing = true;
			introing = false;

			var outros = 1;

			div_transition.run(false, function() {
				component.fire("outro.end", { node: div });
				if (--outros === 0) { outrocallback(); }
				div_transition = null;
			});
		},

		u: function unmount() {
			div_1.innerHTML = '';

			detachNode(div);
		},

		d: noop
	};
}

function Text(options) {
	this._debugName = '<Text>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data$19(), options.data);
	if (!('disabled' in this._state)) { console.warn("<Text> was created without expected data property 'disabled'"); }
	if (!('width' in this._state)) { console.warn("<Text> was created without expected data property 'width'"); }
	if (!('label' in this._state)) { console.warn("<Text> was created without expected data property 'label'"); }
	if (!('help' in this._state)) { console.warn("<Text> was created without expected data property 'help'"); }
	if (!('placeholder' in this._state)) { console.warn("<Text> was created without expected data property 'placeholder'"); }
	if (!('value' in this._state)) { console.warn("<Text> was created without expected data property 'value'"); }
	if (!('disabled_msg' in this._state)) { console.warn("<Text> was created without expected data property 'disabled_msg'"); }

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$21(this, this._state);

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

assign(Text.prototype, protoDev);

Text.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/TextArea.html generated by Svelte v1.64.0 */

function data$20() {
    return {
        placeholder: ''
    };
}
function create_main_fragment$22(component, state) {
	var text, textarea, textarea_updating = false, text_1;

	function textarea_input_handler() {
		textarea_updating = true;
		component.set({ value: textarea.value });
		textarea_updating = false;
	}

	var controlgroup_initial_data = {
	 	disabled: state.disabled,
	 	type: "textarea",
	 	width: state.width,
	 	label: state.label,
	 	help: state.help
	 };
	var controlgroup = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_initial_data
	});

	return {
		c: function create() {
			text = createText("\n    ");
			textarea = createElement("textarea");
			text_1 = createText("\n");
			controlgroup._fragment.c();
			this.h();
		},

		h: function hydrate() {
			addListener(textarea, "input", textarea_input_handler);
			textarea.placeholder = state.placeholder;
			setStyle(textarea, "width", ( state.width || 'auto' ));
		},

		m: function mount(target, anchor) {
			appendNode(text, controlgroup._slotted.default);
			appendNode(textarea, controlgroup._slotted.default);

			textarea.value = state.value;

			appendNode(text_1, controlgroup._slotted.default);
			controlgroup._mount(target, anchor);
		},

		p: function update(changed, state) {
			if (!textarea_updating) { textarea.value = state.value; }
			if (changed.placeholder) {
				textarea.placeholder = state.placeholder;
			}

			if (changed.width) {
				setStyle(textarea, "width", ( state.width || 'auto' ));
			}

			var controlgroup_changes = {};
			if (changed.disabled) { controlgroup_changes.disabled = state.disabled; }
			if (changed.width) { controlgroup_changes.width = state.width; }
			if (changed.label) { controlgroup_changes.label = state.label; }
			if (changed.help) { controlgroup_changes.help = state.help; }
			controlgroup._set(controlgroup_changes);
		},

		u: function unmount() {
			controlgroup._unmount();
		},

		d: function destroy$$1() {
			removeListener(textarea, "input", textarea_input_handler);
			controlgroup.destroy(false);
		}
	};
}

function TextArea(options) {
	this._debugName = '<TextArea>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data$20(), options.data);
	if (!('disabled' in this._state)) { console.warn("<TextArea> was created without expected data property 'disabled'"); }
	if (!('width' in this._state)) { console.warn("<TextArea> was created without expected data property 'width'"); }
	if (!('label' in this._state)) { console.warn("<TextArea> was created without expected data property 'label'"); }
	if (!('help' in this._state)) { console.warn("<TextArea> was created without expected data property 'help'"); }
	if (!('value' in this._state)) { console.warn("<TextArea> was created without expected data property 'value'"); }
	if (!('placeholder' in this._state)) { console.warn("<TextArea> was created without expected data property 'placeholder'"); }

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$22(this, this._state);

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

assign(TextArea.prototype, protoDev);

TextArea.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* Users/sjockers/Projects/datawrapper/dw-docker/mounts/datawrapper/node_modules/@datawrapper/controls/TypeAhead.html generated by Svelte v1.64.0 */

function matches(ref) {
    var query = ref.query;
    var items = ref.items;
    var filter = ref.filter;

    if (!filter) { return items; }
    if (!query) { return items; }
    // check if items is an array
    if (!items || !items.filter) { return []; }
    return items.filter(function (item) {
        return (item.search || item.title || item.name).toLowerCase().indexOf(query.toLowerCase()) > -1;
    });
}
function data$21() {
    return {
        selection: '',
        query: '',
        icon: false,
        placeholder: '',
        filter: 'indexOf',
        selectedItem: undefined,
        selectedIndex: undefined,
        searching: false,
        open: false,
        items: [] // items look like this {id: "foo", title: "", "display": "..."}
    };
}
var methods$11 = {
    focus: function focus() {
        this.refs.searchInput.focus();
    },

    blur: function blur() {
        this.refs.searchInput.blur();
    },

    onClick: function onClick(event) {
        this.set({ open: true });
        this.fire('focus', event);
    },

    search: function search(query) {
        this.set({ open: true });
        // we're firing the "search" event so that the
        // parent component can update the "items" list
        this.fire('search', { query: query });
    },

    select: function select(item, event) {
        this.set({
            selectedItem: item,
            query: item.display || item.title || item.name,
            open: false
        });
        if (event) { event.stopPropagation(); }
        this.fire('select', { item: item });
    },

    keyup: function keyup(event) {
        if (!event) { return; }
        if (event.keyCode === 13) {
            // RETURN key
            var ref = this.get();
            var selectedItem = ref.selectedItem;
            this.select(selectedItem);
        }
        if (event.keyCode === 38 || event.keyCode === 40) {
            // ARROW UP/DOWN
            var ref$1 = this.get();
            var selectedIndex = ref$1.selectedIndex;
            var matches = ref$1.matches;
            if (isNaN(selectedIndex)) { selectedIndex = -1; }
            var len = matches.length || 0;
            if (event.keyCode === 38) {
                selectedIndex = (selectedIndex - 1 + len) % len;
            }
            if (event.keyCode === 40) {
                selectedIndex = (selectedIndex + 1) % len;
            }

            this.set({
                selectedIndex: selectedIndex,
                selectedItem: matches[selectedIndex]
            });
        }
        if (event.keyCode === 27) {
            // ESCAPE
            this.set({ open: false });
            this.blur();
        }
    }
};

function onupdate$3(ref) {
    var changed = ref.changed;
    var current = ref.current;

    if (changed.selectedIndex && this.refs.dropdown) {
        var dd = this.refs.dropdown;
        var i = current.selectedIndex;
        var liBox = dd.children[i].getBoundingClientRect();
        var ulBox = dd.getBoundingClientRect();
        if (liBox.y + liBox.height - ulBox.y > ulBox.height) {
            // li is out of bottom view
            dd.scrollBy(0, liBox.y + liBox.height - ulBox.y - ulBox.height + 5);
        } else if (liBox.y - ulBox.y < 0) {
            // li is out of top view
            dd.scrollBy(0, liBox.y - ulBox.y - 5);
        }
    }
}
function create_main_fragment$23(component, state) {
	var div, div_1, input, input_updating = false, input_placeholder_value, text, text_1, div_2, slot_content_button = component._slotted.button, button, text_5, div_1_class_value;

	function onwindowclick(event) {
		component.set({open:false});
	}
	window.addEventListener("click", onwindowclick);

	function input_input_handler() {
		input_updating = true;
		component.set({ query: input.value });
		input_updating = false;
	}

	function keydown_handler(event) {
		component.keyup(event);
	}

	function input_handler(event) {
		var state = component.get();
		component.search(state.query);
	}

	var if_block = (state.icon) && create_if_block$18(component, state);

	function click_handler(event) {
		component.set({open:true});
	}

	var if_block_1 = (state.open && state.matches.length) && create_if_block_1$11(component, state);

	function click_handler_1(event) {
		component.onClick(event);
	}

	function click_handler_2(event) {
		event.stopPropagation();
	}

	return {
		c: function create() {
			div = createElement("div");
			div_1 = createElement("div");
			input = createElement("input");
			text = createText("\n\n        ");
			if (if_block) { if_block.c(); }
			text_1 = createText("\n\n        ");
			div_2 = createElement("div");
			if (!slot_content_button) {
				button = createElement("button");
				button.innerHTML = "<span class=\"caret\"></span>";
			}
			text_5 = createText("\n\n        ");
			if (if_block_1) { if_block_1.c(); }
			this.h();
		},

		h: function hydrate() {
			addListener(input, "input", input_input_handler);
			addListener(input, "keydown", keydown_handler);
			addListener(input, "input", input_handler);
			setAttribute(input, "type", "search");
			input.placeholder = input_placeholder_value = state.open ? state.placeholder : state.selection||state.placeholder;
			input.className = "svelte-6lqhz6";
			if (!slot_content_button) {
				addListener(button, "click", click_handler);
				button.className = "btn btn-small btn-primary svelte-6lqhz6";
			}
			div_2.className = "btn-wrap svelte-6lqhz6";
			addListener(div_1, "click", click_handler_1);
			div_1.className = div_1_class_value = "dropdown " + (state.icon?'icon':'') + " " + (!state.open && state.selection ? 'selection' : '') + " svelte-6lqhz6";
			addListener(div, "click", click_handler_2);
			div.className = "control-group vis-option-group vis-option-type-select";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(div_1, div);
			appendNode(input, div_1);
			component.refs.searchInput = input;

			input.value = state.query;

			appendNode(text, div_1);
			if (if_block) { if_block.m(div_1, null); }
			appendNode(text_1, div_1);
			appendNode(div_2, div_1);
			if (!slot_content_button) {
				appendNode(button, div_2);
			}

			else {
				appendNode(slot_content_button, div_2);
			}

			appendNode(text_5, div_1);
			if (if_block_1) { if_block_1.m(div_1, null); }
		},

		p: function update(changed, state) {
			if (!input_updating) { input.value = state.query; }
			if ((changed.open || changed.placeholder || changed.selection) && input_placeholder_value !== (input_placeholder_value = state.open ? state.placeholder : state.selection||state.placeholder)) {
				input.placeholder = input_placeholder_value;
			}

			if (state.icon) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$18(component, state);
					if_block.c();
					if_block.m(div_1, text_1);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			if (state.open && state.matches.length) {
				if (if_block_1) {
					if_block_1.p(changed, state);
				} else {
					if_block_1 = create_if_block_1$11(component, state);
					if_block_1.c();
					if_block_1.m(div_1, null);
				}
			} else if (if_block_1) {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = null;
			}

			if ((changed.icon || changed.open || changed.selection) && div_1_class_value !== (div_1_class_value = "dropdown " + (state.icon?'icon':'') + " " + (!state.open && state.selection ? 'selection' : '') + " svelte-6lqhz6")) {
				div_1.className = div_1_class_value;
			}
		},

		u: function unmount() {
			detachNode(div);
			if (if_block) { if_block.u(); }

			if (slot_content_button) {
				reinsertChildren(div_2, slot_content_button);
			}

			if (if_block_1) { if_block_1.u(); }
		},

		d: function destroy$$1() {
			window.removeEventListener("click", onwindowclick);

			removeListener(input, "input", input_input_handler);
			removeListener(input, "keydown", keydown_handler);
			removeListener(input, "input", input_handler);
			if (component.refs.searchInput === input) { component.refs.searchInput = null; }
			if (if_block) { if_block.d(); }
			if (!slot_content_button) {
				removeListener(button, "click", click_handler);
			}
			if (if_block_1) { if_block_1.d(); }
			removeListener(div_1, "click", click_handler_1);
			removeListener(div, "click", click_handler_2);
		}
	};
}

// (14:8) {#if icon}
function create_if_block$18(component, state) {
	var i, i_class_value;

	return {
		c: function create() {
			i = createElement("i");
			this.h();
		},

		h: function hydrate() {
			i.className = i_class_value = "icon " + state.icon + " svelte-6lqhz6";
		},

		m: function mount(target, anchor) {
			insertNode(i, target, anchor);
		},

		p: function update(changed, state) {
			if ((changed.icon) && i_class_value !== (i_class_value = "icon " + state.icon + " svelte-6lqhz6")) {
				i.className = i_class_value;
			}
		},

		u: function unmount() {
			detachNode(i);
		},

		d: noop
	};
}

// (28:12) {#each matches as item,i}
function create_each_block$9(component, state) {
	var item = state.item, each_value = state.each_value, i = state.i;
	var li, raw_value = item.display || item.title || item.name, li_class_value, li_style_value;

	return {
		c: function create() {
			li = createElement("li");
			this.h();
		},

		h: function hydrate() {
			addListener(li, "click", click_handler$3);
			li.className = li_class_value = "" + (i==state.selectedIndex?'selected':'') + " svelte-6lqhz6";
			li.style.cssText = li_style_value = item.style||'';

			li._svelte = {
				component: component,
				each_value: state.each_value,
				i: state.i
			};
		},

		m: function mount(target, anchor) {
			insertNode(li, target, anchor);
			li.innerHTML = raw_value;
		},

		p: function update(changed, state) {
			item = state.item;
			each_value = state.each_value;
			i = state.i;
			if ((changed.matches) && raw_value !== (raw_value = item.display || item.title || item.name)) {
				li.innerHTML = raw_value;
			}

			if ((changed.selectedIndex) && li_class_value !== (li_class_value = "" + (i==state.selectedIndex?'selected':'') + " svelte-6lqhz6")) {
				li.className = li_class_value;
			}

			if ((changed.matches) && li_style_value !== (li_style_value = item.style||'')) {
				li.style.cssText = li_style_value;
			}

			li._svelte.each_value = state.each_value;
			li._svelte.i = state.i;
		},

		u: function unmount() {
			li.innerHTML = '';

			detachNode(li);
		},

		d: function destroy$$1() {
			removeListener(li, "click", click_handler$3);
		}
	};
}

// (26:8) {#if open && matches.length}
function create_if_block_1$11(component, state) {
	var ul;

	var each_value = state.matches;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$9(component, assign(assign({}, state), {
			each_value: each_value,
			item: each_value[i],
			i: i
		}));
	}

	return {
		c: function create() {
			ul = createElement("ul");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			this.h();
		},

		h: function hydrate() {
			ul.className = "dropdown-results svelte-6lqhz6";
		},

		m: function mount(target, anchor) {
			insertNode(ul, target, anchor);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(ul, null);
			}

			component.refs.dropdown = ul;
		},

		p: function update(changed, state) {
			var each_value = state.matches;

			if (changed.selectedIndex || changed.matches) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						item: each_value[i],
						i: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$9(component, each_context);
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
			detachNode(ul);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			if (component.refs.dropdown === ul) { component.refs.dropdown = null; }
		}
	};
}

function click_handler$3(event) {
	var component = this._svelte.component;
	var each_value = this._svelte.each_value, i = this._svelte.i, item = each_value[i];
	component.select(item, event);
}

function TypeAhead(options) {
	this._debugName = '<TypeAhead>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this.refs = {};
	this._state = assign(data$21(), options.data);
	this._recompute({ query: 1, items: 1, filter: 1 }, this._state);
	if (!('query' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'query'"); }
	if (!('items' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'items'"); }
	if (!('filter' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'filter'"); }
	if (!('icon' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'icon'"); }
	if (!('open' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'open'"); }
	if (!('selection' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'selection'"); }
	if (!('placeholder' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'placeholder'"); }

	if (!('selectedIndex' in this._state)) { console.warn("<TypeAhead> was created without expected data property 'selectedIndex'"); }
	this._handlers.update = [onupdate$3];

	this._slotted = options.slots || {};

	var self = this;
	var _oncreate = function() {
		var changed = { query: 1, items: 1, filter: 1, icon: 1, open: 1, selection: 1, placeholder: 1, matches: 1, selectedIndex: 1 };
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
	}

	this.slots = {};

	this._fragment = create_main_fragment$23(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._oncreate);
	}
}

assign(TypeAhead.prototype, protoDev);
assign(TypeAhead.prototype, methods$11);

TypeAhead.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('matches' in newState && !this._updatingReadonlyProperty) { throw new Error("<TypeAhead>: Cannot set read-only property 'matches'"); }
};

TypeAhead.prototype._recompute = function _recompute(changed, state) {
	if (changed.query || changed.items || changed.filter) {
		if (this._differs(state.matches, (state.matches = matches(state)))) { changed.matches = true; }
	}
};

/* admin/users/UserDetails.html generated by Svelte v1.64.0 */

var ref = window.location;
var protocol = ref.protocol;
var host = ref.host;

function role(ref) {
	var user = ref.user;
	var roleOptions = ref.roleOptions;

	return roleOptions.find(function (ref) {
		var slug = ref.slug;

		return slug === user.role;
	});
}

function createdAtFormatted(ref) {
	var user = ref.user;

	return moment(user.createdAt).format(__('YYYY-MM-DD, hh:mm a', 'admin-users'));
}

function passwordResetLink(ref) {
	var user = ref.user;

	return (protocol + "//" + host + "/account/reset-password/" + (encodeURI(user.resetPasswordToken)));
}

function data$22() {
	return {
    resetPasswordToken: '',
    user: {},
    updates: {}
};
}

var methods$12 = {
    close: function close() {
        this.fire('close');
    },

    save: function save(event) {
        event.preventDefault();
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

    resetPassword: function resetPassword() {
        var ref = this.get();
        var user = ref.user;
        var resetPasswordToken = ref.resetPasswordToken;
        this.fire('resetPassword', {
            email: user.email,
            token: resetPasswordToken
        });
    },

    resendActivation: function resendActivation() {
        var ref = this.get();
        var user = ref.user;
        this.fire('resendActivation', { email: user.email });
    }
};

function oncreate$4() {
    // clone original user & token data:
    var ref = this.get();
    var user = ref.user;

    this.set({
        updates: Object.assign({}, user)
    });
}
function create_main_fragment$24(component, state) {
	var section, h4, text_value = state.user.email, text, text_1, form, text_2, span, text_3_value = state.user.id, text_3, text_4, text_5, text_6, input, input_updating = false, text_7, text_8, text_9, input_1, input_1_updating = false, text_10, text_11, text_12, select, select_updating = false, text_13, text_14, text_15, a, text_16_value = state.user.chartCount, text_16, a_href_value, text_17, text_18, text_19, span_1, text_20, text_21, text_22, text_23, div, text_24, input_2, input_2_updating = false, text_25, button, text_26_value = __('password-reset / send', 'admin-users'), text_26, text_29, text_30, text_31, text_32, div_1, button_1, text_33_value = __('actions / save', 'admin-users'), text_33, text_35, button_2, text_36_value = __('actions / cancel', 'admin-users'), text_36, text_39;

	var controlgroup_initial_data = { label: "#" };
	var controlgroup = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_initial_data
	});

	function input_input_handler() {
		var state = component.get();
		input_updating = true;
		state.updates.name = input.value;
		component.set({ updates: state.updates, roleOptions: state.roleOptions });
		input_updating = false;
	}

	var controlgroup_1_initial_data = { label: __('name', 'admin-users') };
	var controlgroup_1 = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_1_initial_data
	});

	function input_1_input_handler() {
		var state = component.get();
		input_1_updating = true;
		state.updates.email = input_1.value;
		component.set({ updates: state.updates, roleOptions: state.roleOptions });
		input_1_updating = false;
	}

	var controlgroup_2_initial_data = { label: __('email', 'admin-users') };
	var controlgroup_2 = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_2_initial_data
	});

	var each_value = state.roleOptions;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$10(component, assign(assign({}, state), {
			each_value: each_value,
			role: each_value[i],
			role_index: i
		}));
	}

	function select_change_handler() {
		var state = component.get();
		select_updating = true;
		state.updates.role = selectValue(select);
		component.set({ updates: state.updates, roleOptions: state.roleOptions });
		select_updating = false;
	}

	var controlgroup_3_initial_data = { label: __('status', 'admin-users') };
	var controlgroup_3 = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_3_initial_data
	});

	var controlgroup_4_initial_data = { label: __('charts', 'admin-users') };
	var controlgroup_4 = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_4_initial_data
	});

	var controlgroup_5_initial_data = { label: __('created-at', 'admin-users') };
	var controlgroup_5 = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_5_initial_data
	});

	var if_block = (state.user.resetPasswordToken) && create_if_block$19(component, state);

	function input_2_input_handler() {
		input_2_updating = true;
		component.set({ resetPasswordToken: input_2.value });
		input_2_updating = false;
	}

	function click_handler(event) {
		component.resetPassword();
	}

	var controlgroup_6_initial_data = { label: __('password-reset', 'admin-users') };
	var controlgroup_6 = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_6_initial_data
	});

	var if_block_1 = (state.user.activateToken) && create_if_block_1$12(component, state);

	function click_handler_1(event) {
		component.close();
	}

	var controlgroup_7_initial_data = { label: __('status', 'admin-users') };
	var controlgroup_7 = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_7_initial_data
	});

	function submit_handler(event) {
		component.save(event);
	}

	return {
		c: function create() {
			section = createElement("section");
			h4 = createElement("h4");
			text = createText(text_value);
			text_1 = createText("\n\n    ");
			form = createElement("form");
			text_2 = createText("\n            ");
			span = createElement("span");
			text_3 = createText(text_3_value);
			text_4 = createText("\n        ");
			controlgroup._fragment.c();
			text_5 = createText("\n\n        ");
			text_6 = createText("\n            ");
			input = createElement("input");
			text_7 = createText("\n        ");
			controlgroup_1._fragment.c();
			text_8 = createText("\n\n        ");
			text_9 = createText("\n            ");
			input_1 = createElement("input");
			text_10 = createText("\n        ");
			controlgroup_2._fragment.c();
			text_11 = createText("\n\n        ");
			text_12 = createText("\n            ");
			select = createElement("select");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			text_13 = createText("\n        ");
			controlgroup_3._fragment.c();
			text_14 = createText("\n\n        ");
			text_15 = createText("\n            ");
			a = createElement("a");
			text_16 = createText(text_16_value);
			text_17 = createText("\n        ");
			controlgroup_4._fragment.c();
			text_18 = createText("\n\n        ");
			text_19 = createText("\n            ");
			span_1 = createElement("span");
			text_20 = createText(state.createdAtFormatted);
			text_21 = createText("\n        ");
			controlgroup_5._fragment.c();
			text_22 = createText("\n\n        ");
			text_23 = createText("\n            ");
			div = createElement("div");
			if (if_block) { if_block.c(); }
			text_24 = createText("\n                ");
			input_2 = createElement("input");
			text_25 = createText("\n                ");
			button = createElement("button");
			text_26 = createText(text_26_value);
			text_29 = createText("\n        ");
			controlgroup_6._fragment.c();
			text_30 = createText("\n\n        ");
			if (if_block_1) { if_block_1.c(); }
			text_31 = createText("\n\n        ");
			text_32 = createText("\n            ");
			div_1 = createElement("div");
			button_1 = createElement("button");
			text_33 = createText(text_33_value);
			text_35 = createText("\n                ");
			button_2 = createElement("button");
			text_36 = createText(text_36_value);
			text_39 = createText("\n        ");
			controlgroup_7._fragment.c();
			this.h();
		},

		h: function hydrate() {
			span.className = "value svelte-1wvoqzi";
			addListener(input, "input", input_input_handler);
			setAttribute(input, "type", "text");
			addListener(input_1, "input", input_1_input_handler);
			setAttribute(input_1, "type", "text");
			addListener(select, "change", select_change_handler);
			if (!('updates' in state)) { component.root._beforecreate.push(select_change_handler); }
			select.name = "role";
			a.className = "value svelte-1wvoqzi";
			a.href = a_href_value = "/admin/chart/by/" + state.user.id;
			span_1.className = "value svelte-1wvoqzi";
			addListener(input_2, "input", input_2_input_handler);
			setAttribute(input_2, "type", "text");
			input_2.placeholder = "optional: one-time password";
			addListener(button, "click", click_handler);
			button.type = "button";
			button.className = "btn btn-default";
			div.className = "token-block svelte-1wvoqzi";
			button_1.type = "submit";
			button_1.className = "btn btn-primary svelte-1wvoqzi";
			button_1.dataset.test = "save";
			addListener(button_2, "click", click_handler_1);
			button_2.type = "button";
			button_2.className = "btn btn-default svelte-1wvoqzi";
			button_2.dataset.test = "close";
			div_1.className = "controls-submit svelte-1wvoqzi";
			addListener(form, "submit", submit_handler);
			form.className = "form-horizontal";
		},

		m: function mount(target, anchor) {
			insertNode(section, target, anchor);
			appendNode(h4, section);
			appendNode(text, h4);
			appendNode(text_1, section);
			appendNode(form, section);
			appendNode(text_2, controlgroup._slotted.default);
			appendNode(span, controlgroup._slotted.default);
			appendNode(text_3, span);
			appendNode(text_4, controlgroup._slotted.default);
			controlgroup._mount(form, null);
			appendNode(text_5, form);
			appendNode(text_6, controlgroup_1._slotted.default);
			appendNode(input, controlgroup_1._slotted.default);

			input.value = state.updates.name;

			appendNode(text_7, controlgroup_1._slotted.default);
			controlgroup_1._mount(form, null);
			appendNode(text_8, form);
			appendNode(text_9, controlgroup_2._slotted.default);
			appendNode(input_1, controlgroup_2._slotted.default);

			input_1.value = state.updates.email;

			appendNode(text_10, controlgroup_2._slotted.default);
			controlgroup_2._mount(form, null);
			appendNode(text_11, form);
			appendNode(text_12, controlgroup_3._slotted.default);
			appendNode(select, controlgroup_3._slotted.default);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(select, null);
			}

			selectOption(select, state.updates.role);

			appendNode(text_13, controlgroup_3._slotted.default);
			controlgroup_3._mount(form, null);
			appendNode(text_14, form);
			appendNode(text_15, controlgroup_4._slotted.default);
			appendNode(a, controlgroup_4._slotted.default);
			appendNode(text_16, a);
			appendNode(text_17, controlgroup_4._slotted.default);
			controlgroup_4._mount(form, null);
			appendNode(text_18, form);
			appendNode(text_19, controlgroup_5._slotted.default);
			appendNode(span_1, controlgroup_5._slotted.default);
			appendNode(text_20, span_1);
			appendNode(text_21, controlgroup_5._slotted.default);
			controlgroup_5._mount(form, null);
			appendNode(text_22, form);
			appendNode(text_23, controlgroup_6._slotted.default);
			appendNode(div, controlgroup_6._slotted.default);
			if (if_block) { if_block.m(div, null); }
			appendNode(text_24, div);
			appendNode(input_2, div);

			input_2.value = state.resetPasswordToken;

			appendNode(text_25, div);
			appendNode(button, div);
			appendNode(text_26, button);
			appendNode(text_29, controlgroup_6._slotted.default);
			controlgroup_6._mount(form, null);
			appendNode(text_30, form);
			if (if_block_1) { if_block_1.m(form, null); }
			appendNode(text_31, form);
			appendNode(text_32, controlgroup_7._slotted.default);
			appendNode(div_1, controlgroup_7._slotted.default);
			appendNode(button_1, div_1);
			appendNode(text_33, button_1);
			appendNode(text_35, div_1);
			appendNode(button_2, div_1);
			appendNode(text_36, button_2);
			appendNode(text_39, controlgroup_7._slotted.default);
			controlgroup_7._mount(form, null);
		},

		p: function update(changed, state) {
			if ((changed.user) && text_value !== (text_value = state.user.email)) {
				text.data = text_value;
			}

			if ((changed.user) && text_3_value !== (text_3_value = state.user.id)) {
				text_3.data = text_3_value;
			}

			if (!input_updating) { input.value = state.updates.name; }

			var controlgroup_1_changes = {};
			controlgroup_1_changes.label = __('name', 'admin-users');
			controlgroup_1._set(controlgroup_1_changes);

			if (!input_1_updating) { input_1.value = state.updates.email; }

			var controlgroup_2_changes = {};
			controlgroup_2_changes.label = __('email', 'admin-users');
			controlgroup_2._set(controlgroup_2_changes);

			var each_value = state.roleOptions;

			if (changed.roleOptions || changed.user) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						role: each_value[i],
						role_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$10(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value.length;
			}

			if (!select_updating) { selectOption(select, state.updates.role); }

			var controlgroup_3_changes = {};
			controlgroup_3_changes.label = __('status', 'admin-users');
			controlgroup_3._set(controlgroup_3_changes);

			if ((changed.user) && text_16_value !== (text_16_value = state.user.chartCount)) {
				text_16.data = text_16_value;
			}

			if ((changed.user) && a_href_value !== (a_href_value = "/admin/chart/by/" + state.user.id)) {
				a.href = a_href_value;
			}

			var controlgroup_4_changes = {};
			controlgroup_4_changes.label = __('charts', 'admin-users');
			controlgroup_4._set(controlgroup_4_changes);

			if (changed.createdAtFormatted) {
				text_20.data = state.createdAtFormatted;
			}

			var controlgroup_5_changes = {};
			controlgroup_5_changes.label = __('created-at', 'admin-users');
			controlgroup_5._set(controlgroup_5_changes);

			if (state.user.resetPasswordToken) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$19(component, state);
					if_block.c();
					if_block.m(div, text_24);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			if (!input_2_updating) { input_2.value = state.resetPasswordToken; }

			var controlgroup_6_changes = {};
			controlgroup_6_changes.label = __('password-reset', 'admin-users');
			controlgroup_6._set(controlgroup_6_changes);

			if (state.user.activateToken) {
				if (if_block_1) {
					if_block_1.p(changed, state);
				} else {
					if_block_1 = create_if_block_1$12(component, state);
					if_block_1.c();
					if_block_1.m(form, text_31);
				}
			} else if (if_block_1) {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = null;
			}

			var controlgroup_7_changes = {};
			controlgroup_7_changes.label = __('status', 'admin-users');
			controlgroup_7._set(controlgroup_7_changes);
		},

		u: function unmount() {
			detachNode(section);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}

			if (if_block) { if_block.u(); }
			if (if_block_1) { if_block_1.u(); }
		},

		d: function destroy$$1() {
			controlgroup.destroy(false);
			removeListener(input, "input", input_input_handler);
			controlgroup_1.destroy(false);
			removeListener(input_1, "input", input_1_input_handler);
			controlgroup_2.destroy(false);

			destroyEach(each_blocks);

			removeListener(select, "change", select_change_handler);
			controlgroup_3.destroy(false);
			controlgroup_4.destroy(false);
			controlgroup_5.destroy(false);
			if (if_block) { if_block.d(); }
			removeListener(input_2, "input", input_2_input_handler);
			removeListener(button, "click", click_handler);
			controlgroup_6.destroy(false);
			if (if_block_1) { if_block_1.d(); }
			removeListener(button_2, "click", click_handler_1);
			controlgroup_7.destroy(false);
			removeListener(form, "submit", submit_handler);
		}
	};
}

// (19:16) {#each roleOptions as role}
function create_each_block$10(component, state) {
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

// (37:16) {#if user.resetPasswordToken}
function create_if_block$19(component, state) {
	var code, text;

	return {
		c: function create() {
			code = createElement("code");
			text = createText(state.passwordResetLink);
			this.h();
		},

		h: function hydrate() {
			code.className = "token svelte-1wvoqzi";
		},

		m: function mount(target, anchor) {
			insertNode(code, target, anchor);
			appendNode(text, code);
		},

		p: function update(changed, state) {
			if (changed.passwordResetLink) {
				text.data = state.passwordResetLink;
			}
		},

		u: function unmount() {
			detachNode(code);
		},

		d: noop
	};
}

// (47:8) {#if user.activateToken}
function create_if_block_1$12(component, state) {
	var text, div, code, text_1_value = state.user.activateToken, text_1, text_2, button, text_3_value = __('activation-token / send', 'admin-users'), text_3, text_6;

	function click_handler(event) {
		component.resendActivation();
	}

	var controlgroup_initial_data = { label: __('activation-token', 'admin-users') };
	var controlgroup = new ControlGroup({
		root: component.root,
		slots: { default: createFragment() },
		data: controlgroup_initial_data
	});

	return {
		c: function create() {
			text = createText("\n            ");
			div = createElement("div");
			code = createElement("code");
			text_1 = createText(text_1_value);
			text_2 = createText("\n                ");
			button = createElement("button");
			text_3 = createText(text_3_value);
			text_6 = createText("\n        ");
			controlgroup._fragment.c();
			this.h();
		},

		h: function hydrate() {
			code.className = "token svelte-1wvoqzi";
			addListener(button, "click", click_handler);
			button.type = "button";
			button.className = "btn btn-default";
			div.className = "token-block svelte-1wvoqzi";
		},

		m: function mount(target, anchor) {
			appendNode(text, controlgroup._slotted.default);
			appendNode(div, controlgroup._slotted.default);
			appendNode(code, div);
			appendNode(text_1, code);
			appendNode(text_2, div);
			appendNode(button, div);
			appendNode(text_3, button);
			appendNode(text_6, controlgroup._slotted.default);
			controlgroup._mount(target, anchor);
		},

		p: function update(changed, state) {
			if ((changed.user) && text_1_value !== (text_1_value = state.user.activateToken)) {
				text_1.data = text_1_value;
			}

			var controlgroup_changes = {};
			controlgroup_changes.label = __('activation-token', 'admin-users');
			controlgroup._set(controlgroup_changes);
		},

		u: function unmount() {
			controlgroup._unmount();
		},

		d: function destroy$$1() {
			removeListener(button, "click", click_handler);
			controlgroup.destroy(false);
		}
	};
}

function UserDetails(options) {
	this._debugName = '<UserDetails>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data$22(), options.data);
	this._recompute({ user: 1, roleOptions: 1 }, this._state);
	if (!('user' in this._state)) { console.warn("<UserDetails> was created without expected data property 'user'"); }
	if (!('roleOptions' in this._state)) { console.warn("<UserDetails> was created without expected data property 'roleOptions'"); }
	if (!('updates' in this._state)) { console.warn("<UserDetails> was created without expected data property 'updates'"); }


	if (!('resetPasswordToken' in this._state)) { console.warn("<UserDetails> was created without expected data property 'resetPasswordToken'"); }

	var self = this;
	var _oncreate = function() {
		var changed = { user: 1, roleOptions: 1, updates: 1, createdAtFormatted: 1, passwordResetLink: 1, resetPasswordToken: 1 };
		oncreate$4.call(self);
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$24(this, this._state);

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

assign(UserDetails.prototype, protoDev);
assign(UserDetails.prototype, methods$12);

UserDetails.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('role' in newState && !this._updatingReadonlyProperty) { throw new Error("<UserDetails>: Cannot set read-only property 'role'"); }
	if ('createdAtFormatted' in newState && !this._updatingReadonlyProperty) { throw new Error("<UserDetails>: Cannot set read-only property 'createdAtFormatted'"); }
	if ('passwordResetLink' in newState && !this._updatingReadonlyProperty) { throw new Error("<UserDetails>: Cannot set read-only property 'passwordResetLink'"); }
};

UserDetails.prototype._recompute = function _recompute(changed, state) {
	if (changed.user || changed.roleOptions) {
		if (this._differs(state.role, (state.role = role(state)))) { changed.role = true; }
	}

	if (changed.user) {
		if (this._differs(state.createdAtFormatted, (state.createdAtFormatted = createdAtFormatted(state)))) { changed.createdAtFormatted = true; }
		if (this._differs(state.passwordResetLink, (state.passwordResetLink = passwordResetLink(state)))) { changed.passwordResetLink = true; }
	}
};

/* admin/users/Table.html generated by Svelte v1.64.0 */

var methods$13 = {
    sort: function sort(event, orderBy) {
        event.preventDefault();
        this.fire('sort', orderBy);
    }
};

function create_main_fragment$25(component, state) {
	var div, table, colgroup, text_1, thead, tr, text_4, tbody, slot_content_default = component._slotted.default;

	var each_value = state.columnHeaders;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$11(component, assign(assign({}, state), {
			each_value: each_value,
			item: each_value[i],
			item_index: i
		}));
	}

	var each_value_1 = state.columnHeaders;

	var each_1_blocks = [];

	for (var i = 0; i < each_value_1.length; i += 1) {
		each_1_blocks[i] = create_each_block_1$2(component, assign(assign({}, state), {
			each_value_1: each_value_1,
			item: each_value_1[i],
			item_index_1: i
		}));
	}

	return {
		c: function create() {
			div = createElement("div");
			table = createElement("table");
			colgroup = createElement("colgroup");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			text_1 = createText("\n\n        ");
			thead = createElement("thead");
			tr = createElement("tr");

			for (var i = 0; i < each_1_blocks.length; i += 1) {
				each_1_blocks[i].c();
			}

			text_4 = createText("\n\n        ");
			tbody = createElement("tbody");
			this.h();
		},

		h: function hydrate() {
			table.className = "table svelte-1a6fop4";
			div.className = "table-container svelte-1a6fop4";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(table, div);
			appendNode(colgroup, table);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(colgroup, null);
			}

			appendNode(text_1, table);
			appendNode(thead, table);
			appendNode(tr, thead);

			for (var i = 0; i < each_1_blocks.length; i += 1) {
				each_1_blocks[i].m(tr, null);
			}

			appendNode(text_4, table);
			appendNode(tbody, table);

			if (slot_content_default) {
				appendNode(slot_content_default, tbody);
			}
		},

		p: function update(changed, state) {
			var each_value = state.columnHeaders;

			if (changed.columnHeaders) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						item: each_value[i],
						item_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$11(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(colgroup, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value.length;
			}

			var each_value_1 = state.columnHeaders;

			if (changed.columnHeaders) {
				for (var i = 0; i < each_value_1.length; i += 1) {
					var each_1_context = assign(assign({}, state), {
						each_value_1: each_value_1,
						item: each_value_1[i],
						item_index_1: i
					});

					if (each_1_blocks[i]) {
						each_1_blocks[i].p(changed, each_1_context);
					} else {
						each_1_blocks[i] = create_each_block_1$2(component, each_1_context);
						each_1_blocks[i].c();
						each_1_blocks[i].m(tr, null);
					}
				}

				for (; i < each_1_blocks.length; i += 1) {
					each_1_blocks[i].u();
					each_1_blocks[i].d();
				}
				each_1_blocks.length = each_value_1.length;
			}
		},

		u: function unmount() {
			detachNode(div);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}

			for (var i = 0; i < each_1_blocks.length; i += 1) {
				each_1_blocks[i].u();
			}

			if (slot_content_default) {
				reinsertChildren(tbody, slot_content_default);
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			destroyEach(each_1_blocks);
		}
	};
}

// (4:12) {#each columnHeaders as item}
function create_each_block$11(component, state) {
	var item = state.item, each_value = state.each_value, item_index = state.item_index;
	var col;

	return {
		c: function create() {
			col = createElement("col");
			this.h();
		},

		h: function hydrate() {
			setStyle(col, "width", item.width);
		},

		m: function mount(target, anchor) {
			insertNode(col, target, anchor);
		},

		p: function update(changed, state) {
			item = state.item;
			each_value = state.each_value;
			item_index = state.item_index;
			if (changed.columnHeaders) {
				setStyle(col, "width", item.width);
			}
		},

		u: function unmount() {
			detachNode(col);
		},

		d: noop
	};
}

// (11:16) {#each columnHeaders as item}
function create_each_block_1$2(component, state) {
	var item = state.item, each_value_1 = state.each_value_1, item_index_1 = state.item_index_1;
	var th, th_class_value;

	function select_block_type(state) {
		if (item.orderBy) { return create_if_block$20; }
		return create_if_block_1$13;
	}

	var current_block_type = select_block_type(state);
	var if_block = current_block_type(component, state);

	return {
		c: function create() {
			th = createElement("th");
			if_block.c();
			this.h();
		},

		h: function hydrate() {
			th.className = th_class_value = "" + item.className + " svelte-1a6fop4";
		},

		m: function mount(target, anchor) {
			insertNode(th, target, anchor);
			if_block.m(th, null);
		},

		p: function update(changed, state) {
			item = state.item;
			each_value_1 = state.each_value_1;
			item_index_1 = state.item_index_1;
			if (current_block_type === (current_block_type = select_block_type(state)) && if_block) {
				if_block.p(changed, state);
			} else {
				if_block.u();
				if_block.d();
				if_block = current_block_type(component, state);
				if_block.c();
				if_block.m(th, null);
			}

			if ((changed.columnHeaders) && th_class_value !== (th_class_value = "" + item.className + " svelte-1a6fop4")) {
				th.className = th_class_value;
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

// (13:20) {#if item.orderBy}
function create_if_block$20(component, state) {
	var item = state.item, each_value_1 = state.each_value_1, item_index_1 = state.item_index_1;
	var a, text_value = item.name, text, a_href_value;

	return {
		c: function create() {
			a = createElement("a");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			addListener(a, "click", click_handler$4);
			a.className = "col";
			a.href = a_href_value = "?orderBy=" + (item.orderBy);

			a._svelte = {
				component: component,
				each_value_1: state.each_value_1,
				item_index_1: state.item_index_1
			};
		},

		m: function mount(target, anchor) {
			insertNode(a, target, anchor);
			appendNode(text, a);
		},

		p: function update(changed, state) {
			item = state.item;
			each_value_1 = state.each_value_1;
			item_index_1 = state.item_index_1;
			if ((changed.columnHeaders) && text_value !== (text_value = item.name)) {
				text.data = text_value;
			}

			if ((changed.columnHeaders) && a_href_value !== (a_href_value = "?orderBy=" + (item.orderBy))) {
				a.href = a_href_value;
			}

			a._svelte.each_value_1 = state.each_value_1;
			a._svelte.item_index_1 = state.item_index_1;
		},

		u: function unmount() {
			detachNode(a);
		},

		d: function destroy$$1() {
			removeListener(a, "click", click_handler$4);
		}
	};
}

// (15:20) {:else}
function create_if_block_1$13(component, state) {
	var item = state.item, each_value_1 = state.each_value_1, item_index_1 = state.item_index_1;
	var span, text_value = item.name, text;

	return {
		c: function create() {
			span = createElement("span");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			span.className = "col";
		},

		m: function mount(target, anchor) {
			insertNode(span, target, anchor);
			appendNode(text, span);
		},

		p: function update(changed, state) {
			item = state.item;
			each_value_1 = state.each_value_1;
			item_index_1 = state.item_index_1;
			if ((changed.columnHeaders) && text_value !== (text_value = item.name)) {
				text.data = text_value;
			}
		},

		u: function unmount() {
			detachNode(span);
		},

		d: noop
	};
}

function click_handler$4(event) {
	var component = this._svelte.component;
	var each_value_1 = this._svelte.each_value_1, item_index_1 = this._svelte.item_index_1, item = each_value_1[item_index_1];
	component.sort(event, item.orderBy);
}

function Table(options) {
	this._debugName = '<Table>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign({}, options.data);
	if (!('columnHeaders' in this._state)) { console.warn("<Table> was created without expected data property 'columnHeaders'"); }

	this._slotted = options.slots || {};

	this.slots = {};

	this._fragment = create_main_fragment$25(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(Table.prototype, protoDev);
assign(Table.prototype, methods$13);

Table.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* admin/users/TableRow.html generated by Svelte v1.64.0 */

var teamLink = function (ref) {
	var name = ref.name;
	var id = ref.id;

	return ("<a href=\"/admin/organizations/" + id + "\">" + name + "</a>");
};

function role$1(ref) {
	var user = ref.user;
	var roleOptions = ref.roleOptions;

	return roleOptions.find(function (ref) {
		var slug = ref.slug;

		return slug === user.role;
	});
}

function createdAtFormatted$1(ref) {
	var user = ref.user;

	return moment(user.createdAt).format(__('date-time-format', 'admin-users'));
}

function teamsFormatted(ref) {
	var user = ref.user;

	return user.teams.map(teamLink).join(', ') || '–';
}

function data$23() {
    return {
        user: {},
        updates: {},
        edit: false,
        roleOptions: []
    };
}
var methods$14 = {
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

function create_main_fragment$26(component, state) {
	var tr, td, a, text_value = state.user.id, text, a_href_value, text_3, text_4, td_1, span, text_6, td_2, span_1, text_7, text_9, td_3, a_1, text_10_value = state.user.chartCount, text_10, a_1_href_value, text_12, td_4, tr_class_value;

	function click_handler(event) {
		var state = component.get();
		component.navigate(event, state.user.id);
	}

	function select_block_type(state) {
		if (!state.edit) { return create_if_block$21; }
		return create_if_block_1$14;
	}

	var current_block_type = select_block_type(state);
	var if_block = current_block_type(component, state);

	function select_block_type_1(state) {
		if (!state.edit) { return create_if_block_2$4; }
		return create_if_block_3$2;
	}

	var current_block_type_1 = select_block_type_1(state);
	var if_block_1 = current_block_type_1(component, state);

	return {
		c: function create() {
			tr = createElement("tr");
			td = createElement("td");
			a = createElement("a");
			text = createText(text_value);
			text_3 = createText("\n\n    ");
			if_block.c();
			text_4 = createText("\n\n    ");
			td_1 = createElement("td");
			span = createElement("span");
			text_6 = createText("\n    ");
			td_2 = createElement("td");
			span_1 = createElement("span");
			text_7 = createText(state.createdAtFormatted);
			text_9 = createText("\n    ");
			td_3 = createElement("td");
			a_1 = createElement("a");
			text_10 = createText(text_10_value);
			text_12 = createText("\n\n    ");
			td_4 = createElement("td");
			if_block_1.c();
			this.h();
		},

		h: function hydrate() {
			addListener(a, "click", click_handler);
			a.href = a_href_value = "?currentUser=" + state.user.id;
			td.className = "col-num svelte-d019lu";
			span.className = "col svelte-d019lu";
			td_1.dataset.test = "display-teams";
			td_1.className = "svelte-d019lu";
			span_1.className = "col svelte-d019lu";
			td_2.dataset.test = "display-createdat";
			td_2.className = "svelte-d019lu";
			a_1.className = "col col-num svelte-d019lu";
			a_1.href = a_1_href_value = "/admin/chart/by/" + state.user.id;
			td_3.className = "svelte-d019lu";
			td_4.className = "actions svelte-d019lu";
			tr.className = tr_class_value = "user role-" + state.user.role + " svelte-d019lu";
		},

		m: function mount(target, anchor) {
			insertNode(tr, target, anchor);
			appendNode(td, tr);
			appendNode(a, td);
			appendNode(text, a);
			appendNode(text_3, tr);
			if_block.m(tr, null);
			appendNode(text_4, tr);
			appendNode(td_1, tr);
			appendNode(span, td_1);
			span.innerHTML = state.teamsFormatted;
			appendNode(text_6, tr);
			appendNode(td_2, tr);
			appendNode(span_1, td_2);
			appendNode(text_7, span_1);
			appendNode(text_9, tr);
			appendNode(td_3, tr);
			appendNode(a_1, td_3);
			appendNode(text_10, a_1);
			appendNode(text_12, tr);
			appendNode(td_4, tr);
			if_block_1.m(td_4, null);
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
				if_block.m(tr, text_4);
			}

			if (changed.teamsFormatted) {
				span.innerHTML = state.teamsFormatted;
			}

			if (changed.createdAtFormatted) {
				text_7.data = state.createdAtFormatted;
			}

			if ((changed.user) && text_10_value !== (text_10_value = state.user.chartCount)) {
				text_10.data = text_10_value;
			}

			if ((changed.user) && a_1_href_value !== (a_1_href_value = "/admin/chart/by/" + state.user.id)) {
				a_1.href = a_1_href_value;
			}

			if (current_block_type_1 !== (current_block_type_1 = select_block_type_1(state))) {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = current_block_type_1(component, state);
				if_block_1.c();
				if_block_1.m(td_4, null);
			}

			if ((changed.user) && tr_class_value !== (tr_class_value = "user role-" + state.user.role + " svelte-d019lu")) {
				tr.className = tr_class_value;
			}
		},

		u: function unmount() {
			span.innerHTML = '';

			detachNode(tr);
			if_block.u();
			if_block_1.u();
		},

		d: function destroy$$1() {
			removeListener(a, "click", click_handler);
			if_block.d();
			if_block_1.d();
		}
	};
}

// (30:12) {#each roleOptions as role}
function create_each_block$12(component, state) {
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

// (8:4) {#if !edit}
function create_if_block$21(component, state) {
	var td, span, text_value = state.user.name || '–', text, text_2, td_1, span_1, text_3_value = state.user.email || '–', text_3, text_5, td_2, span_2, i, i_class_value, text_6, text_7_value = __(state.role.name, 'admin-users'), text_7;

	return {
		c: function create() {
			td = createElement("td");
			span = createElement("span");
			text = createText(text_value);
			text_2 = createText("\n    ");
			td_1 = createElement("td");
			span_1 = createElement("span");
			text_3 = createText(text_3_value);
			text_5 = createText("\n    ");
			td_2 = createElement("td");
			span_2 = createElement("span");
			i = createElement("i");
			text_6 = createText("\n            ");
			text_7 = createText(text_7_value);
			this.h();
		},

		h: function hydrate() {
			span.className = "col svelte-d019lu";
			td.className = "svelte-d019lu";
			span_1.className = "col svelte-d019lu";
			td_1.className = "svelte-d019lu";
			i.className = i_class_value = "icon-" + state.role.icon + " svelte-d019lu";
			i.title = "Editor";
			span_2.className = "col svelte-d019lu";
			td_2.className = "svelte-d019lu";
		},

		m: function mount(target, anchor) {
			insertNode(td, target, anchor);
			appendNode(span, td);
			appendNode(text, span);
			insertNode(text_2, target, anchor);
			insertNode(td_1, target, anchor);
			appendNode(span_1, td_1);
			appendNode(text_3, span_1);
			insertNode(text_5, target, anchor);
			insertNode(td_2, target, anchor);
			appendNode(span_2, td_2);
			appendNode(i, span_2);
			appendNode(text_6, span_2);
			appendNode(text_7, span_2);
		},

		p: function update(changed, state) {
			if ((changed.user) && text_value !== (text_value = state.user.name || '–')) {
				text.data = text_value;
			}

			if ((changed.user) && text_3_value !== (text_3_value = state.user.email || '–')) {
				text_3.data = text_3_value;
			}

			if ((changed.role) && i_class_value !== (i_class_value = "icon-" + state.role.icon + " svelte-d019lu")) {
				i.className = i_class_value;
			}

			if ((changed.role) && text_7_value !== (text_7_value = __(state.role.name, 'admin-users'))) {
				text_7.data = text_7_value;
			}
		},

		u: function unmount() {
			detachNode(td);
			detachNode(text_2);
			detachNode(td_1);
			detachNode(text_5);
			detachNode(td_2);
		},

		d: noop
	};
}

// (21:4) {:else}
function create_if_block_1$14(component, state) {
	var td, input, input_updating = false, text_1, td_1, input_1, input_1_updating = false, text_3, td_2, select, select_updating = false;

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

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$12(component, assign(assign({}, state), {
			each_value: each_value,
			role: each_value[i],
			role_index: i
		}));
	}

	function select_change_handler() {
		var state = component.get();
		select_updating = true;
		state.updates.role = selectValue(select);
		component.set({ updates: state.updates, roleOptions: state.roleOptions });
		select_updating = false;
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

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			this.h();
		},

		h: function hydrate() {
			addListener(input, "input", input_input_handler);
			setAttribute(input, "type", "text");
			input.dataset.test = "input-name";
			input.className = "svelte-d019lu";
			td.className = "svelte-d019lu";
			addListener(input_1, "input", input_1_input_handler);
			setAttribute(input_1, "type", "email");
			input_1.dataset.test = "input-email";
			input_1.className = "svelte-d019lu";
			td_1.className = "email svelte-d019lu";
			addListener(select, "change", select_change_handler);
			if (!('updates' in state)) { component.root._beforecreate.push(select_change_handler); }
			select.name = "role";
			select.className = "svelte-d019lu";
			td_2.className = "svelte-d019lu";
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

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(select, null);
			}

			selectOption(select, state.updates.role);
		},

		p: function update(changed, state) {
			if (!input_updating) { input.value = state.updates.name; }
			if (!input_1_updating) { input_1.value = state.updates.email; }

			var each_value = state.roleOptions;

			if (changed.roleOptions || changed.user) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						role: each_value[i],
						role_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$12(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value.length;
			}

			if (!select_updating) { selectOption(select, state.updates.role); }
		},

		u: function unmount() {
			detachNode(td);
			detachNode(text_1);
			detachNode(td_1);
			detachNode(text_3);
			detachNode(td_2);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			removeListener(input, "input", input_input_handler);
			removeListener(input_1, "input", input_1_input_handler);

			destroyEach(each_blocks);

			removeListener(select, "change", select_change_handler);
		}
	};
}

// (50:8) {#if !edit}
function create_if_block_2$4(component, state) {
	var button, i, i_title_value;

	function click_handler(event) {
		component.edit();
	}

	return {
		c: function create() {
			button = createElement("button");
			i = createElement("i");
			this.h();
		},

		h: function hydrate() {
			i.className = "icon-pencil";
			i.title = i_title_value = __('actions / edit', 'admin-users');
			addListener(button, "click", click_handler);
			button.className = "action svelte-d019lu";
			button.dataset.test = "action-edit";
		},

		m: function mount(target, anchor) {
			insertNode(button, target, anchor);
			appendNode(i, button);
		},

		u: function unmount() {
			detachNode(button);
		},

		d: function destroy$$1() {
			removeListener(button, "click", click_handler);
		}
	};
}

// (54:8) {:else}
function create_if_block_3$2(component, state) {
	var button, i, i_title_value, text_1, button_1, i_1, i_1_title_value;

	function click_handler(event) {
		component.save();
	}

	function click_handler_1(event) {
		component.set({ edit: false });
	}

	return {
		c: function create() {
			button = createElement("button");
			i = createElement("i");
			text_1 = createText("\n        ");
			button_1 = createElement("button");
			i_1 = createElement("i");
			this.h();
		},

		h: function hydrate() {
			i.className = "icon-ok";
			i.title = i_title_value = __('actions / save', 'admin-users');
			addListener(button, "click", click_handler);
			button.className = "action svelte-d019lu";
			button.dataset.test = "action-save";
			i_1.className = "icon-remove";
			i_1.title = i_1_title_value = __('actions / cancel', 'admin-users');
			addListener(button_1, "click", click_handler_1);
			button_1.className = "action svelte-d019lu";
			button_1.dataset.test = "action-close";
		},

		m: function mount(target, anchor) {
			insertNode(button, target, anchor);
			appendNode(i, button);
			insertNode(text_1, target, anchor);
			insertNode(button_1, target, anchor);
			appendNode(i_1, button_1);
		},

		u: function unmount() {
			detachNode(button);
			detachNode(text_1);
			detachNode(button_1);
		},

		d: function destroy$$1() {
			removeListener(button, "click", click_handler);
			removeListener(button_1, "click", click_handler_1);
		}
	};
}

function TableRow(options) {
	this._debugName = '<TableRow>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data$23(), options.data);
	this._recompute({ user: 1, roleOptions: 1 }, this._state);
	if (!('user' in this._state)) { console.warn("<TableRow> was created without expected data property 'user'"); }
	if (!('roleOptions' in this._state)) { console.warn("<TableRow> was created without expected data property 'roleOptions'"); }
	if (!('edit' in this._state)) { console.warn("<TableRow> was created without expected data property 'edit'"); }

	if (!('updates' in this._state)) { console.warn("<TableRow> was created without expected data property 'updates'"); }

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
	}

	this._fragment = create_main_fragment$26(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._beforecreate);
	}
}

assign(TableRow.prototype, protoDev);
assign(TableRow.prototype, methods$14);

TableRow.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('role' in newState && !this._updatingReadonlyProperty) { throw new Error("<TableRow>: Cannot set read-only property 'role'"); }
	if ('createdAtFormatted' in newState && !this._updatingReadonlyProperty) { throw new Error("<TableRow>: Cannot set read-only property 'createdAtFormatted'"); }
	if ('teamsFormatted' in newState && !this._updatingReadonlyProperty) { throw new Error("<TableRow>: Cannot set read-only property 'teamsFormatted'"); }
};

TableRow.prototype._recompute = function _recompute(changed, state) {
	if (changed.user || changed.roleOptions) {
		if (this._differs(state.role, (state.role = role$1(state)))) { changed.role = true; }
	}

	if (changed.user) {
		if (this._differs(state.createdAtFormatted, (state.createdAtFormatted = createdAtFormatted$1(state)))) { changed.createdAtFormatted = true; }
		if (this._differs(state.teamsFormatted, (state.teamsFormatted = teamsFormatted(state)))) { changed.teamsFormatted = true; }
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

var methods$15 = {
    navigate: function navigate(event, state) {
        event.preventDefault();
        this.fire('navigate', state);
    }
};

function create_main_fragment$27(component, state) {
	var div, ul;

	var each_value = state.items;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$13(component, assign(assign({}, state), {
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
						each_blocks[i] = create_each_block$13(component, each_context);
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
function create_each_block$13(component, state) {
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
			addListener(a, "click", click_handler$5);
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
			removeListener(a, "click", click_handler$5);
		}
	};
}

function click_handler$5(event) {
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

	this._fragment = create_main_fragment$27(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(Pagination.prototype, protoDev);
assign(Pagination.prototype, methods$15);

Pagination.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('items' in newState && !this._updatingReadonlyProperty) { throw new Error("<Pagination>: Cannot set read-only property 'items'"); }
};

Pagination.prototype._recompute = function _recompute(changed, state) {
	if (changed.pages || changed.url || changed.currentPageNum) {
		if (this._differs(state.items, (state.items = items(state)))) { changed.items = true; }
	}
};

/* admin/users/App.html generated by Svelte v1.64.0 */

var API_BASE_PATH = '/v3';

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

function baseUrl(ref) {
	var api_domain = ref.api_domain;

	return ("//" + api_domain + API_BASE_PATH);
}

function data$24() {
	return {
    list: [],
    orderBy: 'id',
    loader: null,
    offset: 0,
    limit: 10,
    total: 0,
    currentUser: null,
    userDetails: null
};
}

var columnHeaders = [
    { width: '9%', name: '#', orderBy: 'id', className: 'col-num' },
    { width: '12%', name: __('name', 'admin-users'), orderBy: 'name' },
    { width: '20%', name: __('email', 'admin-users'), orderBy: 'email' },
    { width: '15%', name: __('status', 'admin-users') },
    { width: '15%', name: __('teams', 'admin-users') },
    { width: '18%', name: __('created-at', 'admin-users'), orderBy: 'createdAt' },
    { width: '05%', name: __('charts', 'admin-users'), className: 'col-num' },
    { width: '06%', name: __('actions', 'admin-users'), className: 'col-num' }
];

var roleOptions = [
    { name: 'role / admin', slug: 'admin', icon: 'fire' },
    { name: 'role / editor', slug: 'editor', icon: 'user' },
    { name: 'role / pending', slug: 'pending', icon: 'user' }
];

var methods$16 = {
    update: function update(ref) {
        var offset = ref.offset;
        var orderBy = ref.orderBy;
        var currentUser = ref.currentUser;
        var userDetails = ref.userDetails;

        this.set({ offset: offset, orderBy: orderBy, currentUser: currentUser, userDetails: userDetails });
        if (currentUser) {
            this.loadUser();
        } else {
            this.loadUserList();
        }
    },

    sort: function sort(orderBy) {
        this.set({ orderBy: orderBy, offset: 0 });
        var state = { orderBy: orderBy };
        window.history.pushState(state, '', ("?" + (queryString_3(state))));
        this.loadUserList();
    },

    gotoPage: function gotoPage(ref) {
        var offset = ref.offset;
        var limit = ref.limit;

        this.set({ offset: offset, limit: limit });
        var ref$1 = this.get();
        var orderBy = ref$1.orderBy;
        var state = { offset: offset, limit: limit, orderBy: orderBy };
        window.history.pushState(state, '', ("?" + (queryString_3(state))));
        this.loadUserList();
    },

    showDetails: function showDetails(currentUser) {
        this.set({ currentUser: currentUser });
        window.history.pushState({ currentUser: currentUser }, '', ("?currentUser=" + currentUser));
        this.loadUser();
    },

    closeDetails: function closeDetails() {
        var ref = this.get();
        var orderBy = ref.orderBy;
        var offset = ref.offset;
        var limit = ref.limit;
        var state = { orderBy: orderBy, offset: offset, limit: limit, currentUser: null, userDetails: null };
        window.history.pushState(state, '', ("?" + (queryString_3(state))));
        this.set(state);
    },

    loadUserList: function loadUserList() {
        var this$1 = this;

        var ref = this.get();
        var offset = ref.offset;
        var limit = ref.limit;
        var orderBy = ref.orderBy;
        var baseUrl = ref.baseUrl;
        var loader = getJSON((baseUrl + "/users?" + (queryString_3({ offset: offset, limit: limit, orderBy: orderBy }))), function (data) {
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
        var baseUrl = ref.baseUrl;
        getJSON((baseUrl + "/users/" + currentUser), function (data) {
            if (data) { this$1.set({ userDetails: data }); }
        });
    },

    saveUser: function saveUser(ref) {
        var this$1 = this;
        var userId = ref.userId;
        var changes = ref.changes;

        var body = JSON.stringify(changes, function (key, value) {
            if (value === null) {
                return undefined; // do not pass `null` (`null` means value not set)
            } else if (value === '') {
                return null; // pass `null` to set value to empty string
            } else {
                return value;
            }
        });

        var ref$1 = this.get();
        var baseUrl = ref$1.baseUrl;

        patchJSON((baseUrl + "/users/" + userId), body)
            .then(function () {
                this$1.loadUserList();
                this$1.closeDetails();
            })
            .catch(function (err) {
                console.error(err);
            });
    },

    resetPassword: function resetPassword(ref) {
        var this$1 = this;
        var email = ref.email;
        var token = ref.token;

        var body = JSON.stringify({ email: email, token: token }, function (key, value) { return value || undefined; });
        var ref$1 = this.get();
        var baseUrl = ref$1.baseUrl;

        window
            .fetch((baseUrl + "/auth/reset-password"), {
                method: 'POST',
                credentials: 'include',
                body: body
            })
            .then(function () {
                this$1.loadUser();
            })
            .catch(function (err) {
                console.error(err);
            });
    },

    resendActivation: function resendActivation(ref) {
        var this$1 = this;
        var email = ref.email;

        var ref$1 = this.get();
        var baseUrl = ref$1.baseUrl;

        window
            .fetch((baseUrl + "/auth/resend-activation"), {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify({ email: email })
            })
            .then(function () {
                this$1.loadUser();
            })
            .catch(function (err) {
                console.error(err);
            });
    }
};

function oncreate$5() {
    var this$1 = this;

    var ref = queryString_2(window.location.search);
    var offset = ref.offset;
    var orderBy = ref.orderBy;
    var currentUser = ref.currentUser;
    this.update({ offset: offset, orderBy: orderBy, currentUser: currentUser });
    window.onpopstate = function (ref) {
    	var state = ref.state;

    	return this$1.update(state);
    };
}
function create_main_fragment$28(component, state) {
	var div;

	function select_block_type(state) {
		if (state.userDetails) { return create_if_block$22; }
		return create_if_block_1$15;
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

// (14:12) {#each list as user}
function create_each_block$14(component, state) {
	var user = state.user, each_value = state.each_value, user_index = state.user_index;

	var usertablerow_initial_data = {
	 	user: user,
	 	roleOptions: roleOptions
	 };
	var usertablerow = new TableRow({
		root: component.root,
		data: usertablerow_initial_data
	});

	usertablerow.on("navigate", function(event) {
		component.showDetails(event);
	});
	usertablerow.on("save", function(event) {
		component.saveUser(event);
	});

	return {
		c: function create() {
			usertablerow._fragment.c();
		},

		m: function mount(target, anchor) {
			usertablerow._mount(target, anchor);
		},

		p: function update(changed, state) {
			user = state.user;
			each_value = state.each_value;
			user_index = state.user_index;
			var usertablerow_changes = {};
			if (changed.list) { usertablerow_changes.user = user; }
			usertablerow_changes.roleOptions = roleOptions;
			usertablerow._set(usertablerow_changes);
		},

		u: function unmount() {
			usertablerow._unmount();
		},

		d: function destroy$$1() {
			usertablerow.destroy(false);
		}
	};
}

// (18:8) {#if paginationItems.length > 0}
function create_if_block_2$5(component, state) {
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
function create_if_block$22(component, state) {

	var userdetails_initial_data = { roleOptions: roleOptions, user: state.userDetails };
	var userdetails = new UserDetails({
		root: component.root,
		data: userdetails_initial_data
	});

	userdetails.on("close", function(event) {
		component.closeDetails();
	});
	userdetails.on("save", function(event) {
		component.saveUser(event);
	});
	userdetails.on("resetPassword", function(event) {
		component.resetPassword(event);
	});
	userdetails.on("resendActivation", function(event) {
		component.resendActivation(event);
	});

	return {
		c: function create() {
			userdetails._fragment.c();
		},

		m: function mount(target, anchor) {
			userdetails._mount(target, anchor);
		},

		p: function update(changed, state) {
			var userdetails_changes = {};
			userdetails_changes.roleOptions = roleOptions;
			if (changed.userDetails) { userdetails_changes.user = state.userDetails; }
			userdetails._set(userdetails_changes);
		},

		u: function unmount() {
			userdetails._unmount();
		},

		d: function destroy$$1() {
			userdetails.destroy(false);
		}
	};
}

// (11:4) {:else}
function create_if_block_1$15(component, state) {
	var div, text, each_anchor, text_1, text_2;

	var each_value = state.list;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$14(component, assign(assign({}, state), {
			each_value: each_value,
			user: each_value[i],
			user_index: i
		}));
	}

	var usertable_initial_data = { columnHeaders: columnHeaders };
	var usertable = new Table({
		root: component.root,
		slots: { default: createFragment() },
		data: usertable_initial_data
	});

	usertable.on("sort", function(event) {
		component.sort(event);
	});

	var if_block = (state.paginationItems.length > 0) && create_if_block_2$5(component, state);

	return {
		c: function create() {
			div = createElement("div");
			text = createText("\n            ");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_anchor = createComment();
			text_1 = createText("\n        ");
			usertable._fragment.c();
			text_2 = createText("\n        ");
			if (if_block) { if_block.c(); }
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(text, usertable._slotted.default);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(usertable._slotted.default, null);
			}

			appendNode(each_anchor, usertable._slotted.default);
			appendNode(text_1, usertable._slotted.default);
			usertable._mount(div, null);
			appendNode(text_2, div);
			if (if_block) { if_block.m(div, null); }
		},

		p: function update(changed, state) {
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
						each_blocks[i] = create_each_block$14(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(each_anchor.parentNode, each_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value.length;
			}

			var usertable_changes = {};
			usertable_changes.columnHeaders = columnHeaders;
			usertable._set(usertable_changes);

			if (state.paginationItems.length > 0) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block_2$5(component, state);
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
			destroyEach(each_blocks);

			usertable.destroy(false);
			if (if_block) { if_block.d(); }
		}
	};
}

function App(options) {
	this._debugName = '<App>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data$24(), options.data);
	this._recompute({ limit: 1, offset: 1, total: 1, api_domain: 1 }, this._state);
	if (!('limit' in this._state)) { console.warn("<App> was created without expected data property 'limit'"); }
	if (!('offset' in this._state)) { console.warn("<App> was created without expected data property 'offset'"); }
	if (!('total' in this._state)) { console.warn("<App> was created without expected data property 'total'"); }
	if (!('api_domain' in this._state)) { console.warn("<App> was created without expected data property 'api_domain'"); }
	if (!('userDetails' in this._state)) { console.warn("<App> was created without expected data property 'userDetails'"); }
	if (!('list' in this._state)) { console.warn("<App> was created without expected data property 'list'"); }

	var self = this;
	var _oncreate = function() {
		var changed = { limit: 1, offset: 1, total: 1, api_domain: 1, userDetails: 1, list: 1, paginationItems: 1, currentPageNum: 1 };
		oncreate$5.call(self);
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$28(this, this._state);

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
assign(App.prototype, methods$16);

App.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('currentPageNum' in newState && !this._updatingReadonlyProperty) { throw new Error("<App>: Cannot set read-only property 'currentPageNum'"); }
	if ('paginationItems' in newState && !this._updatingReadonlyProperty) { throw new Error("<App>: Cannot set read-only property 'paginationItems'"); }
	if ('baseUrl' in newState && !this._updatingReadonlyProperty) { throw new Error("<App>: Cannot set read-only property 'baseUrl'"); }
};

App.prototype._recompute = function _recompute(changed, state) {
	if (changed.limit || changed.offset) {
		if (this._differs(state.currentPageNum, (state.currentPageNum = currentPageNum(state)))) { changed.currentPageNum = true; }
	}

	if (changed.total || changed.limit || changed.offset) {
		if (this._differs(state.paginationItems, (state.paginationItems = paginationItems(state)))) { changed.paginationItems = true; }
	}

	if (changed.api_domain) {
		if (this._differs(state.baseUrl, (state.baseUrl = baseUrl(state)))) { changed.baseUrl = true; }
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
