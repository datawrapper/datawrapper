(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.publish = factory());
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

/* editor/Help.html generated by Svelte v1.64.0 */

function data() {
    return {
        visible: false
    };
}
var methods = {
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

function create_main_fragment(component, state) {
	var div, span, text;

	function select_block_type(state) {
		if (state.visible) { return create_if_block; }
		return create_if_block_1;
	}

	var current_block_type = select_block_type(state);
	var if_block = current_block_type(component, state);

	var if_block_1 = (state.visible) && create_if_block_2(component, state);

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
			span.className = "svelte-1mkn8ur";
			addListener(div, "mouseenter", mouseenter_handler);
			addListener(div, "mouseleave", mouseleave_handler);
			div.className = "help svelte-1mkn8ur";
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
					if_block_1 = create_if_block_2(component, state);
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
function create_if_block(component, state) {
	var i;

	return {
		c: function create() {
			i = createElement("i");
			this.h();
		},

		h: function hydrate() {
			i.className = "im im-graduation-hat svelte-1mkn8ur";
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
function create_if_block_1(component, state) {
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
function create_if_block_2(component, state) {
	var div, slot_content_default = component._slotted.default;

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div.className = "content svelte-1mkn8ur";
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
	this._state = assign(data(), options.data);
	if (!('visible' in this._state)) { console.warn("<Help> was created without expected data property 'visible'"); }

	this._slotted = options.slots || {};

	this.slots = {};

	this._fragment = create_main_fragment(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(Help.prototype, protoDev);
assign(Help.prototype, methods);

Help.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* publish/Action.html generated by Svelte v1.64.0 */

function data$1() {
    return { loading: false };
}
function create_main_fragment$1(component, state) {
	var if_block_anchor;

	var if_block = (state.loading) && create_if_block$1(component, state);

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
			if (state.loading) {
				if (!if_block) {
					if_block = create_if_block$1(component, state);
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

// (2:0) {#if loading}
function create_if_block$1(component, state) {
	var p;

	return {
		c: function create() {
			p = createElement("p");
			p.innerHTML = "<i class=\"fa fa-spinner fa-pulse fa-fw\"></i> loading...";
			this.h();
		},

		h: function hydrate() {
			p.className = "mini-help";
		},

		m: function mount(target, anchor) {
			insertNode(p, target, anchor);
		},

		u: function unmount() {
			detachNode(p);
		},

		d: noop
	};
}

function Action(options) {
	this._debugName = '<Action>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this._state = assign(data$1(), options.data);
	if (!('loading' in this._state)) { console.warn("<Action> was created without expected data property 'loading'"); }

	this._fragment = create_main_fragment$1(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(Action.prototype, protoDev);

Action.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

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

/* @DEPRECATED: plase use @datawrapper/shared instead */
function trackEvent(category, action, name, value) {
    if (window._paq) {
        window._paq.push(['trackEvent', category, action, name, value]);
    }
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
function postJSON(url, body, callback) {
    return fetchJSON(url, 'POST', 'include', body, callback);
}

/**
 * injects a <script> element to the page to load a new JS script
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

/**
 * injects a <link> element to the page to load a new stylesheet
 *
 * @param {string} src
 * @param {function} callback
 */
function loadStylesheet(src, callback) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = src;
    link.onload = function () {
        if (callback) { callback(); }
    };
    document.head.appendChild(link);
}

var widths = [100, 200, 300, 400, 500, 700, 800, 900, 1000];

function computeEmbedHeights() {
    var embedHeights = {};

    // compute embed deltas
    var $ = window.$;
    var previewChart = $($('#iframe-vis')[0].contentDocument);
    // find out default heights
    var defaultHeight = $('h1', previewChart).height() + $('.chart-intro', previewChart).height() + $('.dw-chart-notes', previewChart).height();

    var totalHeight = $('#iframe-vis').height();

    widths.forEach(function (width) {
        // now we resize headline, intro and footer
        previewChart.find('h1,.chart-intro,.dw-chart-notes').css('width', width + 'px');

        var height = $('h1', previewChart).height() + $('.chart-intro', previewChart).height() + $('.dw-chart-notes', previewChart).height();

        embedHeights[width] = totalHeight + (height - defaultHeight);
    });

    previewChart.find('h1,.chart-intro,.dw-chart-notes').css('width', 'auto');

    return embedHeights;
}

/* publish/Publish.html generated by Svelte v1.64.0 */

var fakeProgress = 0;
var initial_auto_publish = true;

function shareUrl(ref) {
    var shareurl_type = ref.shareurl_type;
    var $id = ref.$id;
    var $publicUrl = ref.$publicUrl;
    var plugin_shareurls = ref.plugin_shareurls;
    var published = ref.published;

    if (!published) { return 'https://www.datawrapper.de/...'; }
    if (shareurl_type === 'default') { return $publicUrl; }
    var url = '';
    plugin_shareurls.forEach(function (t) {
        if (t.id === shareurl_type) { url = t.url.replace(/%chart_id%/g, $id); }
    });
    return url;
}
function sortedChartActions(ref) {
    var chartActions = ref.chartActions;
    var $actions = ref.$actions;

    return chartActions
        .concat($actions)
        .filter(function (a) { return a.id !== 'publish-s3'; })
        .sort(function (a, b) { return a.order - b.order; });
}
function data$2() {
    return {
        active_action: '',
        embed_templates: [],
        plugin_shareurls: [],
        published: false,
        publishing: false,
        needs_republish: false,
        publish_error: false,
        auto_publish: false,
        progress: 0,
        shareurl_type: 'default',
        embed_type: 'responsive',
        copy_success: false,
        Action: Action,
        chartActions: [
            {
                id: 'duplicate',
                icon: 'code-fork',
                title: __('Duplicate'),
                order: 500,
                action: 'duplicate'
            }
        ],
        publishHed: '',
        publishIntro: '',
        beforeExport: null,
        exportHed: __('publish / export-duplicate'),
        exportIntro: __('publish / export-duplicate / intro'),
        embedCode: ''
    };
}
var methods$1 = {
    publish: function publish() {
        var this$1 = this;

        this.set({
            publishing: true,
            progress: 0,
            publish_error: false
        });

        var chart = this.store;
        // generate embed codes
        chart.setMetadata('publish.embed-heights', computeEmbedHeights(chart, this.get().embed_templates));

        // save embed heights and wait until it's done before
        // we start to publish the chart
        trackEvent('Chart Editor', 'publish');

        chart.store(function () {
            // publish chart
            postJSON(("/api/charts/" + (chart.get().id) + "/publish"), null, function (res) {
                if (res.status === 'ok') {
                    this$1.publishFinished(res.data);
                    trackEvent('Chart Editor', 'publish-success');
                } else {
                    trackEvent('Chart Editor', 'publish-error', res.message);
                    this$1.set({
                        publish_error: res.message
                    });
                }
            });
            fakeProgress = 0;
            this$1.updateStatus();
        });
    },

    updateProgressBar: function updateProgressBar(p) {
        if (this.refs.bar) {
            this.refs.bar.style.width = (p * 100).toFixed() + '%';
        }
    },

    updateStatus: function updateStatus() {
        var this$1 = this;

        var chart = this.store;
        fakeProgress += 0.05;
        getJSON(("/api/charts/" + (chart.get().id) + "/publish/status"), function (res) {
            if (res) {
                res = +res / 100 + fakeProgress;
                this$1.set({ progress: Math.min(1, res) });
            }
            if (this$1.get().publishing) {
                setTimeout(function () {
                    this$1.updateStatus();
                }, 400);
            }
        });
    },

    publishFinished: function publishFinished(chartInfo) {
        var this$1 = this;

        this.set({
            progress: 1,
            published: true,
            needs_republish: false
        });
        this.store.set({
            lastEditStep: 5
        });
        setTimeout(function () { return this$1.set({ publishing: false }); }, 500);
        this.store.set(chartInfo);
    },

    setEmbedCode: function setEmbedCode() {
        var chart = this.store;
        var ref = this.get();
        var embed_type = ref.embed_type;
        var ref$1 = chart.get();
        var publicUrl = ref$1.publicUrl;
        var embedCodes = chart.getMetadata('publish.embed-codes');
        var embedHeight = chart.getMetadata('publish.embed-height');
        this.set({
            embedCode: embedCodes[embed_type]
                ? embedCodes[embed_type]
                : ("<iframe src=\"" + publicUrl + "\" width=\"100%\" height=\"" + embedHeight + "\" scrolling=\"no\" frameborder=\"0\" allowtransparency=\"true\"></iframe>")
        });
    },

    copy: function copy() {
        var me = this;
        me.refs.embedInput.select();
        try {
            var successful = document.execCommand('copy');
            if (successful) {
                trackEvent('Chart Editor', 'embedcode-copy');
                me.set({ copy_success: true });
                setTimeout(function () { return me.set({ copy_success: false }); }, 300);
            }
        } catch (err) {
            // console.log('Oops, unable to copy');
        }
    },

    select: function select(action, event) {
        var this$1 = this;

        event.preventDefault();
        var ref = this.get();
        var active_action = ref.active_action;
        if (action.id === active_action) {
            // unselect current action
            return this.set({ active_action: '', Action: Action });
        }
        this.set({ active_action: action.id });
        if (action.mod) {
            if (action.mod.App) {
                this.set({ Action: action.mod.App });
            } else {
                // todo: show loading indicator
                this.set({ Action: Action });
                this.refs.action.set({ loading: true });
                if (action.mod.css) {
                    loadStylesheet(action.mod.css);
                }
                loadScript(action.mod.src, function () {
                    setTimeout(function () {
                        require([action.mod.id], function (mod) {
                            // todo: HIDE loading indicator
                            Object.assign(action.mod, mod);
                            this$1.set({ Action: action.mod.App });
                            if (mod.init) { mod.init(this$1.refs.action); }
                            if (action.mod.data) { this$1.refs.action.set(action.mod.data); }
                        });
                    }, 200);
                });
            }
        } else if (action.action && this[action.action]) {
            this.set({ Action: Action });
            this[action.action]();
        } else if (typeof action.action === 'function') {
            this.set({ Action: Action });
            action.action();
        }
    },

    duplicate: function duplicate() {
        var ref = this.store.get();
        var id = ref.id;
        trackEvent('Chart Editor', 'duplicate');
        postJSON(("/api/charts/" + id + "/copy"), null, function (res) {
            if (res.status === 'ok') {
                // redirect to copied chart
                window.location.href = "/edit/" + (res.data.id) + "/visualize";
            } else {
                console.warn(res);
            }
        });
    }
};

function oncreate() {
    var this$1 = this;

    var ref = this.store.get();
    var lastEditStep = ref.lastEditStep;
    this.set({ published: lastEditStep > 4 });
    // store reference to publish step
    window.dw.backend.fire('edit.publish.oncreate', this);
    // watch changes
    this.setEmbedCode();
    var chart = this.store;
    chart.observeDeep('metadata.publish.embed-codes', function () { return this$1.setEmbedCode(); });
    chart.observeDeep('metadata.publish.embed-height', function () { return this$1.setEmbedCode(); });
    chart.observeDeep('publicUrl', function () { return this$1.setEmbedCode(); });
}
function onstate(ref) {
    var changed = ref.changed;
    var current = ref.current;

    var userDataReady = window.dw && window.dw.backend && window.dw.backend.setUserData;
    if (changed.publishing) {
        if (current.publishing) { this.updateProgressBar(current.progress); }
    }
    if (changed.progress) {
        this.updateProgressBar(current.progress);
    }
    if (changed.embed_type && userDataReady) {
        var data = window.dw.backend.__userData;
        if (!current.embed_type || !data) { return; }
        data.embed_type = current.embed_type;
        window.dw.backend.setUserData(data);
    }
    if (changed.embed_type) {
        this.setEmbedCode();
    }
    if (changed.shareurl_type && userDataReady) {
        var data$1 = window.dw.backend.__userData;
        if (!current.shareurl_type || !data$1) { return; }
        data$1.shareurl_type = current.shareurl_type;
        window.dw.backend.setUserData(data$1);
    }
    if (changed.published) {
        window.document.querySelector('.dw-create-publish .publish-step').classList[current.published ? 'add' : 'remove']('is-published');
    }
    if (changed.auto_publish) {
        if (current.auto_publish && initial_auto_publish) {
            this.publish();
            initial_auto_publish = false;
            window.history.replaceState('', '', window.location.pathname);
        }
    }
}
function create_main_fragment$2(component, state) {
	var div, text, text_1, button, button_class_value, text_3, text_4, text_5, text_6, text_7, text_8, div_1, h2, raw_value = __('publish / share-embed'), text_9, div_2, i, text_10, div_3, div_4, b, raw_1_value = __('publish / share-url'), text_11, div_5, label, input, text_12, raw_2_value = __('publish / share-url / fullscreen'), raw_2_before, text_14, text_17, div_6, a, text_18, text_21, text_22, div_7, raw_3_value = __('publish / help / share-url'), text_23, text_25, div_8, i_1, text_26, div_9, div_10, b_1, raw_4_value = __('publish / embed'), text_27, div_11, text_30, div_12, input_1, text_31, button_1, i_2, text_32, text_33_value = __('publish / copy'), text_33, text_34, div_13, text_35_value = __('publish / copy-success'), text_35, div_13_class_value, text_39, text_40, div_14, raw_5_value = __('publish / embed / help'), raw_5_after, text_41, text_43, div_1_class_value, text_46, text_47, div_15, slot_content_export_actions_header = component._slotted.export_actions_header, slot_content_export_actions_header_after, h2_1, text_48, if_block_9_anchor, text_50, ul, text_51;

	var if_block = (state.publishHed) && create_if_block$2(component, state);

	function select_block_type(state) {
		if (state.publishIntro) { return create_if_block_1$1; }
		if (state.published) { return create_if_block_2$1; }
		return create_if_block_3;
	}

	var current_block_type = select_block_type(state);
	var if_block_1 = current_block_type(component, state);

	function select_block_type_1(state) {
		if (state.published) { return create_if_block_4; }
		return create_if_block_5;
	}

	var current_block_type_1 = select_block_type_1(state);
	var if_block_3 = current_block_type_1(component, state);

	function click_handler(event) {
		component.publish();
	}

	var if_block_4 = (!state.published) && create_if_block_6(component, state);

	var if_block_5 = (state.needs_republish && !state.publishing) && create_if_block_7(component, state);

	var if_block_6 = (state.published && !state.needs_republish && state.progress === 1 && !state.publishing) && create_if_block_8(component, state);

	var if_block_7 = (state.publish_error) && create_if_block_9(component, state);

	var if_block_8 = (state.publishing) && create_if_block_10(component, state);

	function input_change_handler() {
		component.set({ shareurl_type: input.__value });
	}

	var each_value = state.plugin_shareurls;

	var each_blocks = [];

	for (var i_3 = 0; i_3 < each_value.length; i_3 += 1) {
		each_blocks[i_3] = create_each_block(component, assign(assign({}, state), {
			each_value: each_value,
			tpl: each_value[i_3],
			tpl_index: i_3
		}));
	}

	var help = new Help({
		root: component.root,
		slots: { default: createFragment() }
	});

	var each_value_1 = state.embed_templates;

	var each_1_blocks = [];

	for (var i_3 = 0; i_3 < each_value_1.length; i_3 += 1) {
		each_1_blocks[i_3] = create_each_block_1(component, assign(assign({}, state), {
			each_value_1: each_value_1,
			tpl: each_value_1[i_3],
			tpl_index_1: i_3
		}));
	}

	function click_handler_1(event) {
		var state = component.get();
		component.copy(state.embedCode);
	}

	var each_value_2 = state.embed_templates.slice(2);

	var each_2_blocks = [];

	for (var i_3 = 0; i_3 < each_value_2.length; i_3 += 1) {
		each_2_blocks[i_3] = create_each_block_2(component, assign(assign({}, state), {
			each_value_2: each_value_2,
			tpl: each_value_2[i_3],
			tpl_index_2: i_3
		}));
	}

	var help_1 = new Help({
		root: component.root,
		slots: { default: createFragment() }
	});

	var switch_value = state.beforeExport;

	function switch_props(state) {
		return {
			root: component.root
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(state));
	}

	var if_block_9 = (state.exportIntro) && create_if_block_11(component, state);

	var each_value_3 = state.sortedChartActions;

	var each_3_blocks = [];

	for (var i_3 = 0; i_3 < each_value_3.length; i_3 += 1) {
		each_3_blocks[i_3] = create_each_block_3(component, assign(assign({}, state), {
			each_value_3: each_value_3,
			action: each_value_3[i_3],
			action_index: i_3
		}));
	}

	var switch_value_1 = state.Action;

	function switch_props_1(state) {
		var switch_instance_1_initial_data = {
		 	visible: true,
		 	show: true
		 };
		return {
			root: component.root,
			data: switch_instance_1_initial_data
		};
	}

	if (switch_value_1) {
		var switch_instance_1 = new switch_value_1(switch_props_1(state));
	}

	return {
		c: function create() {
			div = createElement("div");
			if (if_block) { if_block.c(); }
			text = createText(" ");
			if_block_1.c();
			text_1 = createText("\n\n    ");
			button = createElement("button");
			if_block_3.c();
			text_3 = createText("\n\n    ");
			if (if_block_4) { if_block_4.c(); }
			text_4 = createText(" ");
			if (if_block_5) { if_block_5.c(); }
			text_5 = createText(" ");
			if (if_block_6) { if_block_6.c(); }
			text_6 = createText(" ");
			if (if_block_7) { if_block_7.c(); }
			text_7 = createText(" ");
			if (if_block_8) { if_block_8.c(); }
			text_8 = createText("\n\n    ");
			div_1 = createElement("div");
			h2 = createElement("h2");
			text_9 = createText("\n        ");
			div_2 = createElement("div");
			i = createElement("i");
			text_10 = createText("\n            ");
			div_3 = createElement("div");
			div_4 = createElement("div");
			b = createElement("b");
			text_11 = createText("\n                    ");
			div_5 = createElement("div");
			label = createElement("label");
			input = createElement("input");
			text_12 = createText("\n                            ");
			raw_2_before = createElement('noscript');
			text_14 = createText("\n                        ");

			for (var i_3 = 0; i_3 < each_blocks.length; i_3 += 1) {
				each_blocks[i_3].c();
			}

			text_17 = createText("\n                ");
			div_6 = createElement("div");
			a = createElement("a");
			text_18 = createText(state.shareUrl);
			text_21 = createText("\n            ");
			text_22 = createText("\n                ");
			div_7 = createElement("div");
			text_23 = createText("\n            ");
			help._fragment.c();
			text_25 = createText("\n\n        ");
			div_8 = createElement("div");
			i_1 = createElement("i");
			text_26 = createText("\n            ");
			div_9 = createElement("div");
			div_10 = createElement("div");
			b_1 = createElement("b");
			text_27 = createText("\n                    ");
			div_11 = createElement("div");

			for (var i_3 = 0; i_3 < each_1_blocks.length; i_3 += 1) {
				each_1_blocks[i_3].c();
			}

			text_30 = createText("\n                ");
			div_12 = createElement("div");
			input_1 = createElement("input");
			text_31 = createText("\n                    ");
			button_1 = createElement("button");
			i_2 = createElement("i");
			text_32 = createText(" ");
			text_33 = createText(text_33_value);
			text_34 = createText("\n                    ");
			div_13 = createElement("div");
			text_35 = createText(text_35_value);
			text_39 = createText("\n            ");
			text_40 = createText("\n                ");
			div_14 = createElement("div");
			raw_5_after = createElement('noscript');
			text_41 = createText(" ");

			for (var i_3 = 0; i_3 < each_2_blocks.length; i_3 += 1) {
				each_2_blocks[i_3].c();
			}

			text_43 = createText("\n            ");
			help_1._fragment.c();
			text_46 = createText("\n\n    \n    ");
			if (switch_instance) { switch_instance._fragment.c(); }
			text_47 = createText("\n\n    \n    ");
			div_15 = createElement("div");
			if (!slot_content_export_actions_header) {
				h2_1 = createElement("h2");
				text_48 = createText("\n            ");
				if (if_block_9) { if_block_9.c(); }
				if_block_9_anchor = createComment();
			}
			text_50 = createText("\n\n        ");
			ul = createElement("ul");

			for (var i_3 = 0; i_3 < each_3_blocks.length; i_3 += 1) {
				each_3_blocks[i_3].c();
			}

			text_51 = createText("\n\n        ");
			if (switch_instance_1) { switch_instance_1._fragment.c(); }
			this.h();
		},

		h: function hydrate() {
			addListener(button, "click", click_handler);
			button.disabled = state.publishing;
			button.className = button_class_value = "btn-publish btn btn-primary btn-large " + (state.published?'':'btn-first-publish') + " svelte-tulzqh";
			i.className = "icon fa fa-link fa-fw";
			component._bindingGroups[0].push(input);
			addListener(input, "change", input_change_handler);
			input.__value = "default";
			input.value = input.__value;
			setAttribute(input, "type", "radio");
			input.name = "url-type";
			input.className = "svelte-tulzqh";
			label.className = "radio";
			div_5.className = "embed-options svelte-tulzqh";
			div_4.className = "h";
			a.target = "_blank";
			a.className = "share-url svelte-tulzqh";
			a.href = state.shareUrl;
			div_6.className = "inpt";
			div_3.className = "ctrls";
			div_2.className = "block";
			i_1.className = "icon fa fa-code fa-fw";
			div_11.className = "embed-options svelte-tulzqh";
			div_10.className = "h";
			setAttribute(input_1, "type", "text");
			input_1.className = "input embed-code";
			input_1.readOnly = true;
			input_1.value = state.embedCode;
			i_2.className = "fa fa-copy";
			addListener(button_1, "click", click_handler_1);
			button_1.className = "btn btn-copy";
			button_1.title = "copy";
			div_13.className = div_13_class_value = "copy-success " + (state.copy_success ? 'show':'') + " svelte-tulzqh";
			div_12.className = "inpt";
			div_9.className = "ctrls";
			div_8.className = "block";
			setStyle(div_1, "margin-top", "30px");
			div_1.className = div_1_class_value = state.published?'':'inactive';
			if (!slot_content_export_actions_header) {
				h2_1.className = "pad-top";
			}
			ul.className = "chart-actions";
			div_15.className = "export-and-duplicate";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			if (if_block) { if_block.m(div, null); }
			appendNode(text, div);
			if_block_1.m(div, null);
			appendNode(text_1, div);
			appendNode(button, div);
			if_block_3.m(button, null);
			appendNode(text_3, div);
			if (if_block_4) { if_block_4.m(div, null); }
			appendNode(text_4, div);
			if (if_block_5) { if_block_5.m(div, null); }
			appendNode(text_5, div);
			if (if_block_6) { if_block_6.m(div, null); }
			appendNode(text_6, div);
			if (if_block_7) { if_block_7.m(div, null); }
			appendNode(text_7, div);
			if (if_block_8) { if_block_8.m(div, null); }
			appendNode(text_8, div);
			appendNode(div_1, div);
			appendNode(h2, div_1);
			h2.innerHTML = raw_value;
			appendNode(text_9, div_1);
			appendNode(div_2, div_1);
			appendNode(i, div_2);
			appendNode(text_10, div_2);
			appendNode(div_3, div_2);
			appendNode(div_4, div_3);
			appendNode(b, div_4);
			b.innerHTML = raw_1_value;
			appendNode(text_11, div_4);
			appendNode(div_5, div_4);
			appendNode(label, div_5);
			appendNode(input, label);

			input.checked = input.__value === state.shareurl_type;

			appendNode(text_12, label);
			appendNode(raw_2_before, label);
			raw_2_before.insertAdjacentHTML("afterend", raw_2_value);
			appendNode(text_14, div_5);

			for (var i_3 = 0; i_3 < each_blocks.length; i_3 += 1) {
				each_blocks[i_3].m(div_5, null);
			}

			appendNode(text_17, div_3);
			appendNode(div_6, div_3);
			appendNode(a, div_6);
			appendNode(text_18, a);
			appendNode(text_21, div_2);
			appendNode(text_22, help._slotted.default);
			appendNode(div_7, help._slotted.default);
			div_7.innerHTML = raw_3_value;
			appendNode(text_23, help._slotted.default);
			help._mount(div_2, null);
			appendNode(text_25, div_1);
			appendNode(div_8, div_1);
			appendNode(i_1, div_8);
			appendNode(text_26, div_8);
			appendNode(div_9, div_8);
			appendNode(div_10, div_9);
			appendNode(b_1, div_10);
			b_1.innerHTML = raw_4_value;
			appendNode(text_27, div_10);
			appendNode(div_11, div_10);

			for (var i_3 = 0; i_3 < each_1_blocks.length; i_3 += 1) {
				each_1_blocks[i_3].m(div_11, null);
			}

			appendNode(text_30, div_9);
			appendNode(div_12, div_9);
			appendNode(input_1, div_12);
			component.refs.embedInput = input_1;
			appendNode(text_31, div_12);
			appendNode(button_1, div_12);
			appendNode(i_2, button_1);
			appendNode(text_32, button_1);
			appendNode(text_33, button_1);
			appendNode(text_34, div_12);
			appendNode(div_13, div_12);
			appendNode(text_35, div_13);
			appendNode(text_39, div_8);
			appendNode(text_40, help_1._slotted.default);
			appendNode(div_14, help_1._slotted.default);
			appendNode(raw_5_after, div_14);
			raw_5_after.insertAdjacentHTML("beforebegin", raw_5_value);
			appendNode(text_41, div_14);

			for (var i_3 = 0; i_3 < each_2_blocks.length; i_3 += 1) {
				each_2_blocks[i_3].m(div_14, null);
			}

			appendNode(text_43, help_1._slotted.default);
			help_1._mount(div_8, null);
			appendNode(text_46, div);

			if (switch_instance) {
				switch_instance._mount(div, null);
			}

			appendNode(text_47, div);
			appendNode(div_15, div);
			if (!slot_content_export_actions_header) {
				appendNode(h2_1, div_15);
				h2_1.innerHTML = state.exportHed;
				appendNode(text_48, div_15);
				if (if_block_9) { if_block_9.m(div_15, null); }
				appendNode(if_block_9_anchor, div_15);
			}

			else {
				appendNode(slot_content_export_actions_header, div_15);
				appendNode(slot_content_export_actions_header_after || (slot_content_export_actions_header_after = createComment()), div_15);
			}

			appendNode(text_50, div_15);
			appendNode(ul, div_15);

			for (var i_3 = 0; i_3 < each_3_blocks.length; i_3 += 1) {
				each_3_blocks[i_3].m(ul, null);
			}

			appendNode(text_51, div_15);

			if (switch_instance_1) {
				switch_instance_1._mount(div_15, null);
				component.refs.action = switch_instance_1;
			}
		},

		p: function update(changed, state) {
			if (state.publishHed) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$2(component, state);
					if_block.c();
					if_block.m(div, text);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			if (current_block_type === (current_block_type = select_block_type(state)) && if_block_1) {
				if_block_1.p(changed, state);
			} else {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = current_block_type(component, state);
				if_block_1.c();
				if_block_1.m(div, text_1);
			}

			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(state)) && if_block_3) {
				if_block_3.p(changed, state);
			} else {
				if_block_3.u();
				if_block_3.d();
				if_block_3 = current_block_type_1(component, state);
				if_block_3.c();
				if_block_3.m(button, null);
			}

			if (changed.publishing) {
				button.disabled = state.publishing;
			}

			if ((changed.published) && button_class_value !== (button_class_value = "btn-publish btn btn-primary btn-large " + (state.published?'':'btn-first-publish') + " svelte-tulzqh")) {
				button.className = button_class_value;
			}

			if (!state.published) {
				if (!if_block_4) {
					if_block_4 = create_if_block_6(component, state);
					if_block_4.c();
					if_block_4.m(div, text_4);
				}
			} else if (if_block_4) {
				if_block_4.u();
				if_block_4.d();
				if_block_4 = null;
			}

			if (state.needs_republish && !state.publishing) {
				if (!if_block_5) {
					if_block_5 = create_if_block_7(component, state);
					if_block_5.c();
					if_block_5.m(div, text_5);
				}
			} else if (if_block_5) {
				if_block_5.u();
				if_block_5.d();
				if_block_5 = null;
			}

			if (state.published && !state.needs_republish && state.progress === 1 && !state.publishing) {
				if (!if_block_6) {
					if_block_6 = create_if_block_8(component, state);
					if_block_6.c();
					if_block_6.m(div, text_6);
				}
			} else if (if_block_6) {
				if_block_6.u();
				if_block_6.d();
				if_block_6 = null;
			}

			if (state.publish_error) {
				if (if_block_7) {
					if_block_7.p(changed, state);
				} else {
					if_block_7 = create_if_block_9(component, state);
					if_block_7.c();
					if_block_7.m(div, text_7);
				}
			} else if (if_block_7) {
				if_block_7.u();
				if_block_7.d();
				if_block_7 = null;
			}

			if (state.publishing) {
				if (if_block_8) {
					if_block_8.p(changed, state);
				} else {
					if_block_8 = create_if_block_10(component, state);
					if_block_8.c();
					if_block_8.m(div, text_8);
				}
			} else if (if_block_8) {
				if_block_8.u();
				if_block_8.d();
				if_block_8 = null;
			}

			input.checked = input.__value === state.shareurl_type;

			var each_value = state.plugin_shareurls;

			if (changed.shareurl_type || changed.plugin_shareurls) {
				for (var i_3 = 0; i_3 < each_value.length; i_3 += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						tpl: each_value[i_3],
						tpl_index: i_3
					});

					if (each_blocks[i_3]) {
						each_blocks[i_3].p(changed, each_context);
					} else {
						each_blocks[i_3] = create_each_block(component, each_context);
						each_blocks[i_3].c();
						each_blocks[i_3].m(div_5, null);
					}
				}

				for (; i_3 < each_blocks.length; i_3 += 1) {
					each_blocks[i_3].u();
					each_blocks[i_3].d();
				}
				each_blocks.length = each_value.length;
			}

			if (changed.shareUrl) {
				text_18.data = state.shareUrl;
				a.href = state.shareUrl;
			}

			var each_value_1 = state.embed_templates;

			if (changed.embed_type || changed.embed_templates) {
				for (var i_3 = 0; i_3 < each_value_1.length; i_3 += 1) {
					var each_1_context = assign(assign({}, state), {
						each_value_1: each_value_1,
						tpl: each_value_1[i_3],
						tpl_index_1: i_3
					});

					if (each_1_blocks[i_3]) {
						each_1_blocks[i_3].p(changed, each_1_context);
					} else {
						each_1_blocks[i_3] = create_each_block_1(component, each_1_context);
						each_1_blocks[i_3].c();
						each_1_blocks[i_3].m(div_11, null);
					}
				}

				for (; i_3 < each_1_blocks.length; i_3 += 1) {
					each_1_blocks[i_3].u();
					each_1_blocks[i_3].d();
				}
				each_1_blocks.length = each_value_1.length;
			}

			if (changed.embedCode) {
				input_1.value = state.embedCode;
			}

			if ((changed.copy_success) && div_13_class_value !== (div_13_class_value = "copy-success " + (state.copy_success ? 'show':'') + " svelte-tulzqh")) {
				div_13.className = div_13_class_value;
			}

			var each_value_2 = state.embed_templates.slice(2);

			if (changed.embed_templates) {
				for (var i_3 = 0; i_3 < each_value_2.length; i_3 += 1) {
					var each_2_context = assign(assign({}, state), {
						each_value_2: each_value_2,
						tpl: each_value_2[i_3],
						tpl_index_2: i_3
					});

					if (each_2_blocks[i_3]) {
						each_2_blocks[i_3].p(changed, each_2_context);
					} else {
						each_2_blocks[i_3] = create_each_block_2(component, each_2_context);
						each_2_blocks[i_3].c();
						each_2_blocks[i_3].m(div_14, null);
					}
				}

				for (; i_3 < each_2_blocks.length; i_3 += 1) {
					each_2_blocks[i_3].u();
					each_2_blocks[i_3].d();
				}
				each_2_blocks.length = each_value_2.length;
			}

			if ((changed.published) && div_1_class_value !== (div_1_class_value = state.published?'':'inactive')) {
				div_1.className = div_1_class_value;
			}

			if (switch_value !== (switch_value = state.beforeExport)) {
				if (switch_instance) { switch_instance.destroy(); }

				if (switch_value) {
					switch_instance = new switch_value(switch_props(state));
					switch_instance._fragment.c();
					switch_instance._mount(div, text_47);
				}
			}

			if (!slot_content_export_actions_header) {
				if (changed.exportHed) {
					h2_1.innerHTML = state.exportHed;
				}

					if (state.exportIntro) {
					if (if_block_9) {
						if_block_9.p(changed, state);
					} else {
						if_block_9 = create_if_block_11(component, state);
						if_block_9.c();
						if_block_9.m(if_block_9_anchor.parentNode, if_block_9_anchor);
					}
				} else if (if_block_9) {
					if_block_9.u();
					if_block_9.d();
					if_block_9 = null;
				}

			}

			var each_value_3 = state.sortedChartActions;

			if (changed.sortedChartActions || changed.active_action) {
				for (var i_3 = 0; i_3 < each_value_3.length; i_3 += 1) {
					var each_3_context = assign(assign({}, state), {
						each_value_3: each_value_3,
						action: each_value_3[i_3],
						action_index: i_3
					});

					if (each_3_blocks[i_3]) {
						each_3_blocks[i_3].p(changed, each_3_context);
					} else {
						each_3_blocks[i_3] = create_each_block_3(component, each_3_context);
						each_3_blocks[i_3].c();
						each_3_blocks[i_3].m(ul, null);
					}
				}

				for (; i_3 < each_3_blocks.length; i_3 += 1) {
					each_3_blocks[i_3].u();
					each_3_blocks[i_3].d();
				}
				each_3_blocks.length = each_value_3.length;
			}

			if (switch_value_1 !== (switch_value_1 = state.Action)) {
				if (switch_instance_1) { switch_instance_1.destroy(); }

				if (switch_value_1) {
					switch_instance_1 = new switch_value_1(switch_props_1(state));
					switch_instance_1._fragment.c();
					switch_instance_1._mount(div_15, null);

					component.refs.action = switch_instance_1;
				}

				else if (component.refs.action === switch_instance_1) {
					component.refs.action = null;
				}
			}

			else {
				var switch_instance_1_changes = {};
				switch_instance_1_changes.visible = true;
				switch_instance_1_changes.show = true;
				switch_instance_1._set(switch_instance_1_changes);
			}
		},

		u: function unmount() {
			h2.innerHTML = '';

			b.innerHTML = '';

			detachAfter(raw_2_before);

			div_7.innerHTML = '';

			b_1.innerHTML = '';

			detachBefore(raw_5_after);

			h2_1.innerHTML = '';

			detachNode(div);
			if (if_block) { if_block.u(); }
			if_block_1.u();
			if_block_3.u();
			if (if_block_4) { if_block_4.u(); }
			if (if_block_5) { if_block_5.u(); }
			if (if_block_6) { if_block_6.u(); }
			if (if_block_7) { if_block_7.u(); }
			if (if_block_8) { if_block_8.u(); }

			for (var i_3 = 0; i_3 < each_blocks.length; i_3 += 1) {
				each_blocks[i_3].u();
			}

			for (var i_3 = 0; i_3 < each_1_blocks.length; i_3 += 1) {
				each_1_blocks[i_3].u();
			}

			for (var i_3 = 0; i_3 < each_2_blocks.length; i_3 += 1) {
				each_2_blocks[i_3].u();
			}

			if (!slot_content_export_actions_header) {
				if (if_block_9) { if_block_9.u(); }
			}

			else {
				reinsertBefore(slot_content_export_actions_header_after, slot_content_export_actions_header);
			}

			for (var i_3 = 0; i_3 < each_3_blocks.length; i_3 += 1) {
				each_3_blocks[i_3].u();
			}
		},

		d: function destroy$$1() {
			if (if_block) { if_block.d(); }
			if_block_1.d();
			if_block_3.d();
			removeListener(button, "click", click_handler);
			if (if_block_4) { if_block_4.d(); }
			if (if_block_5) { if_block_5.d(); }
			if (if_block_6) { if_block_6.d(); }
			if (if_block_7) { if_block_7.d(); }
			if (if_block_8) { if_block_8.d(); }
			component._bindingGroups[0].splice(component._bindingGroups[0].indexOf(input), 1);
			removeListener(input, "change", input_change_handler);

			destroyEach(each_blocks);

			help.destroy(false);

			destroyEach(each_1_blocks);

			if (component.refs.embedInput === input_1) { component.refs.embedInput = null; }
			removeListener(button_1, "click", click_handler_1);

			destroyEach(each_2_blocks);

			help_1.destroy(false);
			if (switch_instance) { switch_instance.destroy(false); }
			if (!slot_content_export_actions_header) {
				if (if_block_9) { if_block_9.d(); }
			}

			destroyEach(each_3_blocks);

			if (switch_instance_1) { switch_instance_1.destroy(false); }
		}
	};
}

// (3:4) {#if publishHed}
function create_if_block$2(component, state) {
	var h2;

	return {
		c: function create() {
			h2 = createElement("h2");
			this.h();
		},

		h: function hydrate() {
			h2.className = "pad-top";
		},

		m: function mount(target, anchor) {
			insertNode(h2, target, anchor);
			h2.innerHTML = state.publishHed;
		},

		p: function update(changed, state) {
			if (changed.publishHed) {
				h2.innerHTML = state.publishHed;
			}
		},

		u: function unmount() {
			h2.innerHTML = '';

			detachNode(h2);
		},

		d: noop
	};
}

// (5:10) {#if publishIntro}
function create_if_block_1$1(component, state) {
	var p;

	return {
		c: function create() {
			p = createElement("p");
		},

		m: function mount(target, anchor) {
			insertNode(p, target, anchor);
			p.innerHTML = state.publishIntro;
		},

		p: function update(changed, state) {
			if (changed.publishIntro) {
				p.innerHTML = state.publishIntro;
			}
		},

		u: function unmount() {
			p.innerHTML = '';

			detachNode(p);
		},

		d: noop
	};
}

// (7:12) {#if published}
function create_if_block_2$1(component, state) {
	var p, raw_value = __('publish / republish-intro');

	return {
		c: function create() {
			p = createElement("p");
		},

		m: function mount(target, anchor) {
			insertNode(p, target, anchor);
			p.innerHTML = raw_value;
		},

		p: noop,

		u: function unmount() {
			p.innerHTML = '';

			detachNode(p);
		},

		d: noop
	};
}

// (9:4) {:else}
function create_if_block_3(component, state) {
	var p, raw_value = __('publish / publish-intro');

	return {
		c: function create() {
			p = createElement("p");
			this.h();
		},

		h: function hydrate() {
			setStyle(p, "margin-bottom", "20px");
		},

		m: function mount(target, anchor) {
			insertNode(p, target, anchor);
			p.innerHTML = raw_value;
		},

		p: noop,

		u: function unmount() {
			p.innerHTML = '';

			detachNode(p);
		},

		d: noop
	};
}

// (14:8) {#if published}
function create_if_block_4(component, state) {
	var span, i, i_class_value, text, span_1, text_1_value = __('publish / republish-btn'), text_1;

	return {
		c: function create() {
			span = createElement("span");
			i = createElement("i");
			text = createText(" ");
			span_1 = createElement("span");
			text_1 = createText(text_1_value);
			this.h();
		},

		h: function hydrate() {
			i.className = i_class_value = "fa fa-fw fa-refresh " + (state.publishing ? 'fa-spin' : '') + " svelte-tulzqh";
			span_1.className = "title svelte-tulzqh";
			span.className = "re-publish";
		},

		m: function mount(target, anchor) {
			insertNode(span, target, anchor);
			appendNode(i, span);
			appendNode(text, span);
			appendNode(span_1, span);
			appendNode(text_1, span_1);
		},

		p: function update(changed, state) {
			if ((changed.publishing) && i_class_value !== (i_class_value = "fa fa-fw fa-refresh " + (state.publishing ? 'fa-spin' : '') + " svelte-tulzqh")) {
				i.className = i_class_value;
			}
		},

		u: function unmount() {
			detachNode(span);
		},

		d: noop
	};
}

// (18:8) {:else}
function create_if_block_5(component, state) {
	var span, i, i_class_value, text, span_1, text_1_value = __('publish / publish-btn'), text_1;

	return {
		c: function create() {
			span = createElement("span");
			i = createElement("i");
			text = createText("\n            ");
			span_1 = createElement("span");
			text_1 = createText(text_1_value);
			this.h();
		},

		h: function hydrate() {
			i.className = i_class_value = "fa fa-fw " + (state.publishing ? 'fa-refresh fa-spin' : 'fa-cloud-upload') + " svelte-tulzqh";
			span_1.className = "title svelte-tulzqh";
			span.className = "publish";
		},

		m: function mount(target, anchor) {
			insertNode(span, target, anchor);
			appendNode(i, span);
			appendNode(text, span);
			appendNode(span_1, span);
			appendNode(text_1, span_1);
		},

		p: function update(changed, state) {
			if ((changed.publishing) && i_class_value !== (i_class_value = "fa fa-fw " + (state.publishing ? 'fa-refresh fa-spin' : 'fa-cloud-upload') + " svelte-tulzqh")) {
				i.className = i_class_value;
			}
		},

		u: function unmount() {
			detachNode(span);
		},

		d: noop
	};
}

// (26:4) {#if !published}
function create_if_block_6(component, state) {
	var div, div_1, text_1, div_2, raw_value = __('publish / publish-btn-intro');

	return {
		c: function create() {
			div = createElement("div");
			div_1 = createElement("div");
			div_1.innerHTML = "<i class=\"fa fa-chevron-left\"></i>";
			text_1 = createText("\n        ");
			div_2 = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div_1.className = "arrow svelte-tulzqh";
			div_2.className = "text svelte-tulzqh";
			div.className = "publish-intro svelte-tulzqh";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(div_1, div);
			appendNode(text_1, div);
			appendNode(div_2, div);
			div_2.innerHTML = raw_value;
		},

		u: function unmount() {
			div_2.innerHTML = '';

			detachNode(div);
		},

		d: noop
	};
}

// (35:10) {#if needs_republish && !publishing}
function create_if_block_7(component, state) {
	var div, raw_value = __('publish / republish-alert');

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div.className = "btn-aside alert svelte-tulzqh";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			div.innerHTML = raw_value;
		},

		u: function unmount() {
			div.innerHTML = '';

			detachNode(div);
		},

		d: noop
	};
}

// (39:10) {#if published && !needs_republish && progress === 1 && !publishing}
function create_if_block_8(component, state) {
	var div, raw_value = __('publish / publish-success');

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div.className = "alert alert-success svelte-tulzqh";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			div.innerHTML = raw_value;
		},

		u: function unmount() {
			div.innerHTML = '';

			detachNode(div);
		},

		d: noop
	};
}

// (43:10) {#if publish_error}
function create_if_block_9(component, state) {
	var div;

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div.className = "alert alert-error svelte-tulzqh";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			div.innerHTML = state.publish_error;
		},

		p: function update(changed, state) {
			if (changed.publish_error) {
				div.innerHTML = state.publish_error;
			}
		},

		u: function unmount() {
			div.innerHTML = '';

			detachNode(div);
		},

		d: noop
	};
}

// (47:10) {#if publishing}
function create_if_block_10(component, state) {
	var div, text_value = __("publish / progress / please-wait"), text, text_1, div_1, div_2, div_2_class_value, div_class_value;

	return {
		c: function create() {
			div = createElement("div");
			text = createText(text_value);
			text_1 = createText("\n        ");
			div_1 = createElement("div");
			div_2 = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div_2.className = div_2_class_value = "bar " + (state.progress < 1 ? '' : 'bar-success') + " svelte-tulzqh";
			div_1.className = "progress progress-striped active svelte-tulzqh";
			div.className = div_class_value = "alert " + (state.progress < 1 ? 'alert-info' : 'alert-success') + " publishing" + " svelte-tulzqh";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(text, div);
			appendNode(text_1, div);
			appendNode(div_1, div);
			appendNode(div_2, div_1);
			component.refs.bar = div_2;
		},

		p: function update(changed, state) {
			if ((changed.progress) && div_2_class_value !== (div_2_class_value = "bar " + (state.progress < 1 ? '' : 'bar-success') + " svelte-tulzqh")) {
				div_2.className = div_2_class_value;
			}

			if ((changed.progress) && div_class_value !== (div_class_value = "alert " + (state.progress < 1 ? 'alert-info' : 'alert-success') + " publishing" + " svelte-tulzqh")) {
				div.className = div_class_value;
			}
		},

		u: function unmount() {
			detachNode(div);
		},

		d: function destroy$$1() {
			if (component.refs.bar === div_2) { component.refs.bar = null; }
		}
	};
}

// (68:24) {#each plugin_shareurls as tpl}
function create_each_block(component, state) {
	var tpl = state.tpl, each_value = state.each_value, tpl_index = state.tpl_index;
	var label, input, input_value_value, text, raw_value = tpl.name, raw_before;

	function input_change_handler() {
		component.set({ shareurl_type: input.__value });
	}

	return {
		c: function create() {
			label = createElement("label");
			input = createElement("input");
			text = createText(" ");
			raw_before = createElement('noscript');
			this.h();
		},

		h: function hydrate() {
			component._bindingGroups[0].push(input);
			addListener(input, "change", input_change_handler);
			input.__value = input_value_value = tpl.id;
			input.value = input.__value;
			setAttribute(input, "type", "radio");
			input.name = "url-type";
			input.className = "svelte-tulzqh";
			label.className = "radio";
		},

		m: function mount(target, anchor) {
			insertNode(label, target, anchor);
			appendNode(input, label);

			input.checked = input.__value === state.shareurl_type;

			appendNode(text, label);
			appendNode(raw_before, label);
			raw_before.insertAdjacentHTML("afterend", raw_value);
		},

		p: function update(changed, state) {
			tpl = state.tpl;
			each_value = state.each_value;
			tpl_index = state.tpl_index;
			input.checked = input.__value === state.shareurl_type;
			if ((changed.plugin_shareurls) && input_value_value !== (input_value_value = tpl.id)) {
				input.__value = input_value_value;
			}

			input.value = input.__value;
			if ((changed.plugin_shareurls) && raw_value !== (raw_value = tpl.name)) {
				detachAfter(raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			}
		},

		u: function unmount() {
			detachAfter(raw_before);

			detachNode(label);
		},

		d: function destroy$$1() {
			component._bindingGroups[0].splice(component._bindingGroups[0].indexOf(input), 1);
			removeListener(input, "change", input_change_handler);
		}
	};
}

// (90:24) {#each embed_templates as tpl}
function create_each_block_1(component, state) {
	var tpl = state.tpl, each_value_1 = state.each_value_1, tpl_index_1 = state.tpl_index_1;
	var label, input, input_value_value, text, raw_value = tpl.title, raw_before;

	function input_change_handler() {
		component.set({ embed_type: input.__value });
	}

	return {
		c: function create() {
			label = createElement("label");
			input = createElement("input");
			text = createText(" ");
			raw_before = createElement('noscript');
			this.h();
		},

		h: function hydrate() {
			component._bindingGroups[1].push(input);
			addListener(input, "change", input_change_handler);
			setAttribute(input, "type", "radio");
			input.__value = input_value_value = tpl.id;
			input.value = input.__value;
			input.className = "svelte-tulzqh";
			label.className = "radio";
		},

		m: function mount(target, anchor) {
			insertNode(label, target, anchor);
			appendNode(input, label);

			input.checked = input.__value === state.embed_type;

			appendNode(text, label);
			appendNode(raw_before, label);
			raw_before.insertAdjacentHTML("afterend", raw_value);
		},

		p: function update(changed, state) {
			tpl = state.tpl;
			each_value_1 = state.each_value_1;
			tpl_index_1 = state.tpl_index_1;
			input.checked = input.__value === state.embed_type;
			if ((changed.embed_templates) && input_value_value !== (input_value_value = tpl.id)) {
				input.__value = input_value_value;
			}

			input.value = input.__value;
			if ((changed.embed_templates) && raw_value !== (raw_value = tpl.title)) {
				detachAfter(raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			}
		},

		u: function unmount() {
			detachAfter(raw_before);

			detachNode(label);
		},

		d: function destroy$$1() {
			component._bindingGroups[1].splice(component._bindingGroups[1].indexOf(input), 1);
			removeListener(input, "change", input_change_handler);
		}
	};
}

// (105:58) {#each embed_templates.slice(2) as tpl}
function create_each_block_2(component, state) {
	var tpl = state.tpl, each_value_2 = state.each_value_2, tpl_index_2 = state.tpl_index_2;
	var div, b, text_value = tpl.title, text, text_1, text_2, raw_value = tpl.text, raw_before;

	return {
		c: function create() {
			div = createElement("div");
			b = createElement("b");
			text = createText(text_value);
			text_1 = createText(":");
			text_2 = createText(" ");
			raw_before = createElement('noscript');
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(b, div);
			appendNode(text, b);
			appendNode(text_1, b);
			appendNode(text_2, div);
			appendNode(raw_before, div);
			raw_before.insertAdjacentHTML("afterend", raw_value);
		},

		p: function update(changed, state) {
			tpl = state.tpl;
			each_value_2 = state.each_value_2;
			tpl_index_2 = state.tpl_index_2;
			if ((changed.embed_templates) && text_value !== (text_value = tpl.title)) {
				text.data = text_value;
			}

			if ((changed.embed_templates) && raw_value !== (raw_value = tpl.text)) {
				detachAfter(raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			}
		},

		u: function unmount() {
			detachAfter(raw_before);

			detachNode(div);
		},

		d: noop
	};
}

// (120:12) {#if exportIntro}
function create_if_block_11(component, state) {
	var p;

	return {
		c: function create() {
			p = createElement("p");
		},

		m: function mount(target, anchor) {
			insertNode(p, target, anchor);
			p.innerHTML = state.exportIntro;
		},

		p: function update(changed, state) {
			if (changed.exportIntro) {
				p.innerHTML = state.exportIntro;
			}
		},

		u: function unmount() {
			p.innerHTML = '';

			detachNode(p);
		},

		d: noop
	};
}

// (126:12) {#each sortedChartActions as action}
function create_each_block_3(component, state) {
	var action = state.action, each_value_3 = state.each_value_3, action_index = state.action_index;
	var if_block_anchor;

	var if_block = (action) && create_if_block_12(component, state);

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
			action = state.action;
			each_value_3 = state.each_value_3;
			action_index = state.action_index;
			if (action) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block_12(component, state);
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

// (131:16) {#if action.banner && action.banner.text != "FALSE" && action.banner.text != "-"}
function create_if_block_13(component, state) {
	var action = state.action, each_value_3 = state.each_value_3, action_index = state.action_index;
	var div, text_value = action.banner.text, text, div_style_value;

	return {
		c: function create() {
			div = createElement("div");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			div.className = "banner";
			div.style.cssText = div_style_value = action.banner.style;
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(text, div);
		},

		p: function update(changed, state) {
			action = state.action;
			each_value_3 = state.each_value_3;
			action_index = state.action_index;
			if ((changed.sortedChartActions) && text_value !== (text_value = action.banner.text)) {
				text.data = text_value;
			}

			if ((changed.sortedChartActions) && div_style_value !== (div_style_value = action.banner.style)) {
				div.style.cssText = div_style_value;
			}
		},

		u: function unmount() {
			detachNode(div);
		},

		d: noop
	};
}

// (126:49) {#if action}
function create_if_block_12(component, state) {
	var action = state.action, each_value_3 = state.each_value_3, action_index = state.action_index;
	var li, a, i, i_class_value, span, raw_value = action.title, a_href_value, text_1, li_class_value;

	var if_block = (action.banner && action.banner.text != "FALSE" && action.banner.text != "-") && create_if_block_13(component, state);

	return {
		c: function create() {
			li = createElement("li");
			a = createElement("a");
			i = createElement("i");
			span = createElement("span");
			text_1 = createText("\n                ");
			if (if_block) { if_block.c(); }
			this.h();
		},

		h: function hydrate() {
			i.className = i_class_value = "fa fa-" + action.icon + " svelte-tulzqh";
			span.className = "title svelte-tulzqh";
			addListener(a, "click", click_handler);
			setAttribute(a, "role", "button");
			a.href = a_href_value = action.url ? action.url : '#'+action.id;

			a._svelte = {
				component: component,
				each_value_3: state.each_value_3,
				action_index: state.action_index
			};

			li.className = li_class_value = "action action-" + action.id + " " + (action.class||'') + " " + (action.id == state.active_action ? 'active':'') + " svelte-tulzqh";
		},

		m: function mount(target, anchor) {
			insertNode(li, target, anchor);
			appendNode(a, li);
			appendNode(i, a);
			appendNode(span, a);
			span.innerHTML = raw_value;
			appendNode(text_1, li);
			if (if_block) { if_block.m(li, null); }
		},

		p: function update(changed, state) {
			action = state.action;
			each_value_3 = state.each_value_3;
			action_index = state.action_index;
			if ((changed.sortedChartActions) && i_class_value !== (i_class_value = "fa fa-" + action.icon + " svelte-tulzqh")) {
				i.className = i_class_value;
			}

			if ((changed.sortedChartActions) && raw_value !== (raw_value = action.title)) {
				span.innerHTML = raw_value;
			}

			if ((changed.sortedChartActions) && a_href_value !== (a_href_value = action.url ? action.url : '#'+action.id)) {
				a.href = a_href_value;
			}

			a._svelte.each_value_3 = state.each_value_3;
			a._svelte.action_index = state.action_index;

			if (action.banner && action.banner.text != "FALSE" && action.banner.text != "-") {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block_13(component, state);
					if_block.c();
					if_block.m(li, null);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			if ((changed.sortedChartActions || changed.active_action) && li_class_value !== (li_class_value = "action action-" + action.id + " " + (action.class||'') + " " + (action.id == state.active_action ? 'active':'') + " svelte-tulzqh")) {
				li.className = li_class_value;
			}
		},

		u: function unmount() {
			span.innerHTML = '';

			detachNode(li);
			if (if_block) { if_block.u(); }
		},

		d: function destroy$$1() {
			removeListener(a, "click", click_handler);
			if (if_block) { if_block.d(); }
		}
	};
}

function click_handler(event) {
	var component = this._svelte.component;
	var each_value_3 = this._svelte.each_value_3, action_index = this._svelte.action_index, action = each_value_3[action_index];
	component.select(action, event);
}

function Publish(options) {
	this._debugName = '<Publish>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this.refs = {};
	this._state = assign(assign(this.store._init(["id","publicUrl","actions"]), data$2()), options.data);
	this.store._add(this, ["id","publicUrl","actions"]);
	this._recompute({ shareurl_type: 1, $id: 1, $publicUrl: 1, plugin_shareurls: 1, published: 1, chartActions: 1, $actions: 1 }, this._state);
	if (!('shareurl_type' in this._state)) { console.warn("<Publish> was created without expected data property 'shareurl_type'"); }
	if (!('$id' in this._state)) { console.warn("<Publish> was created without expected data property '$id'"); }
	if (!('$publicUrl' in this._state)) { console.warn("<Publish> was created without expected data property '$publicUrl'"); }
	if (!('plugin_shareurls' in this._state)) { console.warn("<Publish> was created without expected data property 'plugin_shareurls'"); }
	if (!('published' in this._state)) { console.warn("<Publish> was created without expected data property 'published'"); }
	if (!('chartActions' in this._state)) { console.warn("<Publish> was created without expected data property 'chartActions'"); }
	if (!('$actions' in this._state)) { console.warn("<Publish> was created without expected data property '$actions'"); }
	if (!('publishHed' in this._state)) { console.warn("<Publish> was created without expected data property 'publishHed'"); }
	if (!('publishIntro' in this._state)) { console.warn("<Publish> was created without expected data property 'publishIntro'"); }
	if (!('publishing' in this._state)) { console.warn("<Publish> was created without expected data property 'publishing'"); }
	if (!('needs_republish' in this._state)) { console.warn("<Publish> was created without expected data property 'needs_republish'"); }
	if (!('progress' in this._state)) { console.warn("<Publish> was created without expected data property 'progress'"); }
	if (!('publish_error' in this._state)) { console.warn("<Publish> was created without expected data property 'publish_error'"); }

	if (!('embed_templates' in this._state)) { console.warn("<Publish> was created without expected data property 'embed_templates'"); }
	if (!('embed_type' in this._state)) { console.warn("<Publish> was created without expected data property 'embed_type'"); }
	if (!('embedCode' in this._state)) { console.warn("<Publish> was created without expected data property 'embedCode'"); }
	if (!('copy_success' in this._state)) { console.warn("<Publish> was created without expected data property 'copy_success'"); }
	if (!('beforeExport' in this._state)) { console.warn("<Publish> was created without expected data property 'beforeExport'"); }
	if (!('exportHed' in this._state)) { console.warn("<Publish> was created without expected data property 'exportHed'"); }
	if (!('exportIntro' in this._state)) { console.warn("<Publish> was created without expected data property 'exportIntro'"); }

	if (!('active_action' in this._state)) { console.warn("<Publish> was created without expected data property 'active_action'"); }
	if (!('Action' in this._state)) { console.warn("<Publish> was created without expected data property 'Action'"); }
	this._bindingGroups = [[], []];

	this._handlers.state = [onstate];

	this._handlers.destroy = [removeFromStore];

	this._slotted = options.slots || {};

	var self = this;
	var _oncreate = function() {
		var changed = { shareurl_type: 1, $id: 1, $publicUrl: 1, plugin_shareurls: 1, published: 1, chartActions: 1, $actions: 1, publishHed: 1, publishIntro: 1, publishing: 1, needs_republish: 1, progress: 1, publish_error: 1, shareUrl: 1, embed_templates: 1, embed_type: 1, embedCode: 1, copy_success: 1, beforeExport: 1, exportHed: 1, exportIntro: 1, sortedChartActions: 1, active_action: 1, Action: 1 };
		onstate.call(self, { changed: changed, current: self._state });
		oncreate.call(self);
		self.fire("update", { changed: changed, current: self._state });
	};

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this.slots = {};

	this._fragment = create_main_fragment$2(this, this._state);

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

assign(Publish.prototype, protoDev);
assign(Publish.prototype, methods$1);

Publish.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('shareUrl' in newState && !this._updatingReadonlyProperty) { throw new Error("<Publish>: Cannot set read-only property 'shareUrl'"); }
	if ('sortedChartActions' in newState && !this._updatingReadonlyProperty) { throw new Error("<Publish>: Cannot set read-only property 'sortedChartActions'"); }
};

Publish.prototype._recompute = function _recompute(changed, state) {
	if (changed.shareurl_type || changed.$id || changed.$publicUrl || changed.plugin_shareurls || changed.published) {
		if (this._differs(state.shareUrl, (state.shareUrl = shareUrl(state)))) { changed.shareUrl = true; }
	}

	if (changed.chartActions || changed.$actions) {
		if (this._differs(state.sortedChartActions, (state.sortedChartActions = sortedChartActions(state)))) { changed.sortedChartActions = true; }
	}
};

var index = { Publish: Publish };

return index;

})));
//# sourceMappingURL=publish.js.map
