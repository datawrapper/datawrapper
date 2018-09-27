(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/publish', factory) :
	(global.publish = factory());
}(this, (function () { 'use strict';

function noop() {}

function assign(tar, src) {
	for (var k in src) tar[k] = src[k];
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
	while (parent.firstChild) target.appendChild(parent.firstChild);
}

function destroyEach(iterations) {
	for (var i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d();
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

	if (detach !== false) this._fragment.u();
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
	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) return;

	for (var i = 0; i < handlers.length; i += 1) {
		var handler = handlers[i];

		if (!handler.__calling) {
			handler.__calling = true;
			handler.call(this, data);
			handler.__calling = false;
		}
	}
}

function getDev(key) {
	if (key) console.warn("`let x = component.get('x')` is deprecated. Use `let { x } = component.get()` instead");
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
		if (event.changed[key]) fn(event.current[key], event.previous && event.previous[key]);
	});
}

function observeDev(key, callback, options) {
	console.warn("this.observe(key, (newValue, oldValue) => {...}) is deprecated. Use\n\n  // runs before DOM updates\n  this.on('state', ({ changed, current, previous }) => {...});\n\n  // runs after DOM updates\n  this.on('update', ...);\n\n...or add the observe method from the svelte-extras package");

	var c = (key = '' + key).search(/[.[]/);
	if (c > -1) {
		var message =
			'The first argument to component.observe(...) must be the name of a top-level property';
		if (c > 0)
			message += ", i.e. '" + key.slice(0, c) + "' rather than '" + key + "'";

		throw new Error(message);
	}

	return observe.call(this, key, callback, options);
}

function on(eventName, handler) {
	if (eventName === 'teardown') return this.on('destroy', handler);

	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function() {
			var index = handlers.indexOf(handler);
			if (~index) handlers.splice(index, 1);
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
	if (this.root._lock) return;
	this.root._lock = true;
	callAll(this.root._beforecreate);
	callAll(this.root._oncreate);
	callAll(this.root._aftercreate);
	this.root._lock = false;
}

function _set(newState) {
	var oldState = this._state,
		changed = {},
		dirty = false;

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

function _unmount() {
	if (this._fragment) this._fragment.u();
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
    }
}
var methods = {
    show() {
        const t = setTimeout(() => {
            this.set({visible: true});
        }, 400);
        this.set({t});
    },
    hide() {
        const {t} = this.get();
        clearTimeout(t);
        this.set({visible:false});
    }
};

function create_main_fragment(component, state) {
	var div, span, text_1;

	var if_block = (state.visible) && create_if_block(component, state);

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
			this.h();
		},

		h: function hydrate() {
			span.className = "svelte-1mt7hew";
			addListener(div, "mouseenter", mouseenter_handler);
			addListener(div, "mouseleave", mouseleave_handler);
			div.className = "help svelte-1mt7hew";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(span, div);
			appendNode(text_1, div);
			if (if_block) if_block.m(div, null);
		},

		p: function update(changed, state) {
			if (state.visible) {
				if (!if_block) {
					if_block = create_if_block(component, state);
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
			if (if_block) if_block.u();
		},

		d: function destroy$$1() {
			if (if_block) if_block.d();
			removeListener(div, "mouseenter", mouseenter_handler);
			removeListener(div, "mouseleave", mouseleave_handler);
		}
	};
}

// (3:4) {#if visible}
function create_if_block(component, state) {
	var div, slot_content_default = component._slotted.default;

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div.className = "content svelte-1mt7hew";
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
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data(), options.data);
	if (!('visible' in this._state)) console.warn("<Help> was created without expected data property 'visible'");

	this._slotted = options.slots || {};

	this.slots = {};

	this._fragment = create_main_fragment(this, this._state);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(Help.prototype, protoDev);
assign(Help.prototype, methods);

Help.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* globals dw */

function __(key, scope='core') {
    return dw.backend.__messages[scope][key] ||
        // fall back to core
        dw.backend.__messages.core[key] || key;
}

// quick reference variables for speed access

// `_isArray` : an object's function

function fetchJSON(url, method, credentials, body, callback) {
    var opts = {
        method, body,
        mode: 'cors',
        credentials
    };

    window.fetch(url, opts)
    .then((res) => {
        // console.log('status', res);
        if (res.status != 200) return new Error(res.statusText);
        try {
            return res.json();
        } catch (Error) {
            // could not parse json, so just return text
            return res.text();
        }
    })
    .then(callback)
    .catch((err) => {
        console.error(err);
    });
}

function getJSON(url, credentials, callback) {
    if (arguments.length == 2) {
        callback = credentials;
        credentials = "include";
    }

    return fetchJSON(url, 'GET', credentials, null, callback);
}
function postJSON(url, body, callback) { return fetchJSON(url, 'POST', "include", body, callback); }

const widths = [100,200,300,400,500,700,800,900,1000];

function computeEmbedHeights() {
    const embedHeights = {};

    // compute embed deltas
    const $ = window.$;
    const previewChart = $($('#iframe-vis')[0].contentDocument);
    // find out default heights
    const defaultHeight = $('h1', previewChart).height() +
        $('.chart-intro', previewChart).height() +
        $('.dw-chart-notes', previewChart).height();

    const totalHeight = $('#iframe-vis').height();

    widths.forEach(width => {
        // now we resize headline, intro and footer
        previewChart.find('h1,.chart-intro,.dw-chart-notes')
            .css('width', width + "px");

        const height = $('h1', previewChart).height() +
            $('.chart-intro', previewChart).height() +
            $('.dw-chart-notes', previewChart).height();

        embedHeights[width] = totalHeight + (height - defaultHeight);
    });

    previewChart.find('h1,.chart-intro,.dw-chart-notes')
        .css('width', 'auto');

    return embedHeights;
}

/* publish/App.html generated by Svelte v1.64.0 */

let fakeProgress = 0;
let initial_auto_publish = true;

function shareUrl({ shareurl_type, chart, plugin_shareurls, published }) {
    if (!published) return 'https://www.datawrapper.de/...';
    if (shareurl_type == 'default') return chart.publicUrl;
    let url = '';
    plugin_shareurls.forEach(t => {
        if (t.id == shareurl_type) url = t.url.replace(/%chart_id%/g, chart.id);
    });
    return url;
}
function embedCode({ embed_type, chart }) {
    if (!chart.metadata) return '';
    if (chart.metadata.publish && !chart.metadata.publish['embed-codes'])
        return `<iframe src="${chart.publicUrl}" width="100%" height="${chart.metadata.publish['embed-height']}" scrolling="no" frameborder="0" allowtransparency="true"></iframe>`;
    return chart.metadata.publish['embed-codes']['embed-method-'+embed_type];
}
function data$1() {
    return {
        chart: {
            id: ''
        },
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
        copy_success: false
    }
}
var methods$1 = {

    publish () {
        const me = this;
        // wait another 100ms until the page is ready
        if (!window.chart.save) {
            setTimeout(() => { me.publish(); }, 100);
            return;
        }
        const {chart} = me.get();
        me.set({
            publishing: true,
            progress: 0,
            publish_error: false
        });
        // generate embed codes
        chart.metadata.publish['embed-heights'] =
            computeEmbedHeights(chart, me.get('embed_templates'));
        // update charts
        me.set({chart});
        // save embed heights and wait until it's done before
        // we start to publish the chart
        window.chart.attributes(chart).save().then((d) => {
            // publish chart
            postJSON(`/api/charts/${chart.id}/publish`, null, (res) => {
                if (res.status == 'ok') {
                    me.publishFinished(res.data);
                } else {
                    me.set({publish_error: res.message });
                }
            });
            fakeProgress = 0;
            me.updateStatus();
        });
    },

    updateProgressBar (p) {
        if (this.refs.bar) {
            this.refs.bar.style.width = (p*100).toFixed()+'%';
        }
    },

    updateStatus () {
        const me = this;
        const {chart} = me.get();
        fakeProgress += 0.05;
        getJSON(`/api/charts/${chart.id}/publish/status`, (res) => {
            if (res) {
                res = (+res / 100) + fakeProgress;
                me.set({progress: Math.min(1,res)});
            }
            if (me.get().publishing) {
                setTimeout(() => { me.updateStatus(); },400);
            }
        });
    },

    publishFinished (chartInfo) {
        this.set({
            progress: 1,
            published: true,
            needs_republish: false
        });
        setTimeout(() => this.set({publishing: false}), 500);
        this.set({ chart: chartInfo });
        window.chart.attributes(chartInfo);
    },

    copy (embedCode) {
        const me = this;
        console.log('COPY', embedCode);
        me.refs.embedInput.select();
        try {
            var successful = document.execCommand('copy');
            if (successful) {
                me.set({copy_success: true});
                setTimeout(() => me.set({copy_success:false}), 300);
            }
        } catch (err) {
            // console.log('Oops, unable to copy');
        }
    }
};

function onstate({changed, current}) {
    const userDataReady = window.dw && window.dw.backend && window.dw.backend.setUserData;
    if (changed.publishing) {
        if (current.publishing) this.updateProgressBar(current.progress);
    }
    if (changed.progress) {
        this.updateProgressBar(current.progress);
    }
    if (changed.embed_type && userDataReady) {
        const data = window.dw.backend.__userData;
        if (!current.embed_type || !data) return;
        data.embed_type = current.embed_type;
        window.dw.backend.setUserData(data);
    }
    if (changed.shareurl_type && userDataReady) {
        const data = window.dw.backend.__userData;
        if (!current.shareurl_type || !data) return;
        data.shareurl_type = current.shareurl_type;
        window.dw.backend.setUserData(data);
    }
    if (changed.published) {
        window.document
            .querySelector('.dw-create-publish .publish-step')
            .classList[current.published ? 'add' : 'remove']('is-published');
    }
    if (changed.auto_publish) {
        if (current.auto_publish && initial_auto_publish) {
            this.publish();
            initial_auto_publish = false;
            window.history.replaceState('','', location.pathname);
        }
    }
}
function create_main_fragment$1(component, state) {
	var text, button, button_class_value, text_2, text_3, text_4, text_5, text_6, text_7, div, h2, raw_value = __('publish / share-embed'), text_8, div_1, i, text_9, div_2, div_3, b, raw_1_value = __('publish / share-url'), text_10, div_4, label, input, text_11, raw_2_value = __('publish / share-url / fullscreen'), raw_2_before, text_12, text_15, div_5, a, text_16, text_19, text_20, div_6, raw_3_value = __('publish / help / share-url'), text_21, text_23, div_7, i_1, text_24, div_8, div_9, b_1, raw_4_value = __('publish / embed'), text_25, div_10, text_28, div_11, input_1, text_29, button_1, i_2, text_30, text_31_value = __('publish / copy'), text_31, text_32, div_12, text_33_value = __('publish / copy-success'), text_33, div_12_class_value, text_37, text_38, div_13, raw_5_value = __('publish / embed / help'), raw_5_after, text_39, text_41, div_class_value;

	function select_block_type(state) {
		if (state.published) return create_if_block$1;
		return create_if_block_1;
	}

	var current_block_type = select_block_type(state);
	var if_block = current_block_type(component, state);

	function select_block_type_1(state) {
		if (state.published) return create_if_block_2;
		return create_if_block_3;
	}

	var current_block_type_1 = select_block_type_1(state);
	var if_block_1 = current_block_type_1(component, state);

	function click_handler(event) {
		component.publish();
	}

	var if_block_2 = (!state.published) && create_if_block_4(component, state);

	var if_block_3 = (state.needs_republish && !state.publishing) && create_if_block_5(component, state);

	var if_block_4 = (state.published && !state.needs_republish && state.progress == 1 && !state.publishing) && create_if_block_6(component, state);

	var if_block_5 = (state.publish_error) && create_if_block_7(component, state);

	var if_block_6 = (state.publishing) && create_if_block_8(component, state);

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

	return {
		c: function create() {
			if_block.c();
			text = createText("\n\n");
			button = createElement("button");
			if_block_1.c();
			text_2 = createText("\n\n\n");
			if (if_block_2) if_block_2.c();
			text_3 = createText("\n\n\n");
			if (if_block_3) if_block_3.c();
			text_4 = createText("\n");
			if (if_block_4) if_block_4.c();
			text_5 = createText("\n\n");
			if (if_block_5) if_block_5.c();
			text_6 = createText("\n\n");
			if (if_block_6) if_block_6.c();
			text_7 = createText("\n\n");
			div = createElement("div");
			h2 = createElement("h2");
			text_8 = createText("\n    ");
			div_1 = createElement("div");
			i = createElement("i");
			text_9 = createText("\n        ");
			div_2 = createElement("div");
			div_3 = createElement("div");
			b = createElement("b");
			text_10 = createText("\n                ");
			div_4 = createElement("div");
			label = createElement("label");
			input = createElement("input");
			text_11 = createText(" ");
			raw_2_before = createElement('noscript');
			text_12 = createText("\n                    ");

			for (var i_3 = 0; i_3 < each_blocks.length; i_3 += 1) {
				each_blocks[i_3].c();
			}

			text_15 = createText("\n            ");
			div_5 = createElement("div");
			a = createElement("a");
			text_16 = createText(state.shareUrl);
			text_19 = createText("\n        ");
			text_20 = createText("\n            ");
			div_6 = createElement("div");
			text_21 = createText("\n        ");
			help._fragment.c();
			text_23 = createText("\n\n    ");
			div_7 = createElement("div");
			i_1 = createElement("i");
			text_24 = createText("\n        ");
			div_8 = createElement("div");
			div_9 = createElement("div");
			b_1 = createElement("b");
			text_25 = createText("\n                ");
			div_10 = createElement("div");

			for (var i_3 = 0; i_3 < each_1_blocks.length; i_3 += 1) {
				each_1_blocks[i_3].c();
			}

			text_28 = createText("\n            ");
			div_11 = createElement("div");
			input_1 = createElement("input");
			text_29 = createText(" ");
			button_1 = createElement("button");
			i_2 = createElement("i");
			text_30 = createText(" ");
			text_31 = createText(text_31_value);
			text_32 = createText("\n                ");
			div_12 = createElement("div");
			text_33 = createText(text_33_value);
			text_37 = createText("\n        ");
			text_38 = createText("\n            ");
			div_13 = createElement("div");
			raw_5_after = createElement('noscript');
			text_39 = createText("\n                ");

			for (var i_3 = 0; i_3 < each_2_blocks.length; i_3 += 1) {
				each_2_blocks[i_3].c();
			}

			text_41 = createText("\n        ");
			help_1._fragment.c();
			this.h();
		},

		h: function hydrate() {
			addListener(button, "click", click_handler);
			button.disabled = state.publishing;
			button.className = button_class_value = "btn-publish btn btn-primary btn-large " + (state.published?'':'btn-first-publish') + " svelte-178xnhw";
			i.className = "icon fa fa-link fa-fw";
			component._bindingGroups[0].push(input);
			addListener(input, "change", input_change_handler);
			input.__value = "default";
			input.value = input.__value;
			setAttribute(input, "type", "radio");
			input.name = "url-type";
			input.className = "svelte-178xnhw";
			label.className = "radio";
			div_4.className = "embed-options svelte-178xnhw";
			div_3.className = "h";
			a.target = "_blank";
			a.className = "share-url svelte-178xnhw";
			a.href = state.shareUrl;
			div_5.className = "inpt";
			div_2.className = "ctrls";
			div_1.className = "block";
			i_1.className = "icon fa fa-code fa-fw";
			div_10.className = "embed-options svelte-178xnhw";
			div_9.className = "h";
			setAttribute(input_1, "type", "text");
			input_1.className = "input embed-code";
			input_1.readOnly = true;
			input_1.value = state.embedCode;
			i_2.className = "fa fa-copy";
			addListener(button_1, "click", click_handler_1);
			button_1.className = "btn btn-copy";
			button_1.title = "copy";
			div_12.className = div_12_class_value = "copy-success " + (state.copy_success ? 'show':'') + " svelte-178xnhw";
			div_11.className = "inpt";
			div_8.className = "ctrls";
			div_7.className = "block";
			setStyle(div, "margin-top", "20px");
			div.className = div_class_value = state.published?'':'inactive';
		},

		m: function mount(target, anchor) {
			if_block.m(target, anchor);
			insertNode(text, target, anchor);
			insertNode(button, target, anchor);
			if_block_1.m(button, null);
			insertNode(text_2, target, anchor);
			if (if_block_2) if_block_2.m(target, anchor);
			insertNode(text_3, target, anchor);
			if (if_block_3) if_block_3.m(target, anchor);
			insertNode(text_4, target, anchor);
			if (if_block_4) if_block_4.m(target, anchor);
			insertNode(text_5, target, anchor);
			if (if_block_5) if_block_5.m(target, anchor);
			insertNode(text_6, target, anchor);
			if (if_block_6) if_block_6.m(target, anchor);
			insertNode(text_7, target, anchor);
			insertNode(div, target, anchor);
			appendNode(h2, div);
			h2.innerHTML = raw_value;
			appendNode(text_8, div);
			appendNode(div_1, div);
			appendNode(i, div_1);
			appendNode(text_9, div_1);
			appendNode(div_2, div_1);
			appendNode(div_3, div_2);
			appendNode(b, div_3);
			b.innerHTML = raw_1_value;
			appendNode(text_10, div_3);
			appendNode(div_4, div_3);
			appendNode(label, div_4);
			appendNode(input, label);

			input.checked = input.__value === state.shareurl_type;

			appendNode(text_11, label);
			appendNode(raw_2_before, label);
			raw_2_before.insertAdjacentHTML("afterend", raw_2_value);
			appendNode(text_12, div_4);

			for (var i_3 = 0; i_3 < each_blocks.length; i_3 += 1) {
				each_blocks[i_3].m(div_4, null);
			}

			appendNode(text_15, div_2);
			appendNode(div_5, div_2);
			appendNode(a, div_5);
			appendNode(text_16, a);
			appendNode(text_19, div_1);
			appendNode(text_20, help._slotted.default);
			appendNode(div_6, help._slotted.default);
			div_6.innerHTML = raw_3_value;
			appendNode(text_21, help._slotted.default);
			help._mount(div_1, null);
			appendNode(text_23, div);
			appendNode(div_7, div);
			appendNode(i_1, div_7);
			appendNode(text_24, div_7);
			appendNode(div_8, div_7);
			appendNode(div_9, div_8);
			appendNode(b_1, div_9);
			b_1.innerHTML = raw_4_value;
			appendNode(text_25, div_9);
			appendNode(div_10, div_9);

			for (var i_3 = 0; i_3 < each_1_blocks.length; i_3 += 1) {
				each_1_blocks[i_3].m(div_10, null);
			}

			appendNode(text_28, div_8);
			appendNode(div_11, div_8);
			appendNode(input_1, div_11);
			component.refs.embedInput = input_1;
			appendNode(text_29, div_11);
			appendNode(button_1, div_11);
			appendNode(i_2, button_1);
			appendNode(text_30, button_1);
			appendNode(text_31, button_1);
			appendNode(text_32, div_11);
			appendNode(div_12, div_11);
			appendNode(text_33, div_12);
			appendNode(text_37, div_7);
			appendNode(text_38, help_1._slotted.default);
			appendNode(div_13, help_1._slotted.default);
			appendNode(raw_5_after, div_13);
			raw_5_after.insertAdjacentHTML("beforebegin", raw_5_value);
			appendNode(text_39, div_13);

			for (var i_3 = 0; i_3 < each_2_blocks.length; i_3 += 1) {
				each_2_blocks[i_3].m(div_13, null);
			}

			appendNode(text_41, help_1._slotted.default);
			help_1._mount(div_7, null);
		},

		p: function update(changed, state) {
			if (current_block_type !== (current_block_type = select_block_type(state))) {
				if_block.u();
				if_block.d();
				if_block = current_block_type(component, state);
				if_block.c();
				if_block.m(text.parentNode, text);
			}

			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(state)) && if_block_1) {
				if_block_1.p(changed, state);
			} else {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = current_block_type_1(component, state);
				if_block_1.c();
				if_block_1.m(button, null);
			}

			if (changed.publishing) {
				button.disabled = state.publishing;
			}

			if ((changed.published) && button_class_value !== (button_class_value = "btn-publish btn btn-primary btn-large " + (state.published?'':'btn-first-publish') + " svelte-178xnhw")) {
				button.className = button_class_value;
			}

			if (!state.published) {
				if (!if_block_2) {
					if_block_2 = create_if_block_4(component, state);
					if_block_2.c();
					if_block_2.m(text_3.parentNode, text_3);
				}
			} else if (if_block_2) {
				if_block_2.u();
				if_block_2.d();
				if_block_2 = null;
			}

			if (state.needs_republish && !state.publishing) {
				if (!if_block_3) {
					if_block_3 = create_if_block_5(component, state);
					if_block_3.c();
					if_block_3.m(text_4.parentNode, text_4);
				}
			} else if (if_block_3) {
				if_block_3.u();
				if_block_3.d();
				if_block_3 = null;
			}

			if (state.published && !state.needs_republish && state.progress == 1 && !state.publishing) {
				if (!if_block_4) {
					if_block_4 = create_if_block_6(component, state);
					if_block_4.c();
					if_block_4.m(text_5.parentNode, text_5);
				}
			} else if (if_block_4) {
				if_block_4.u();
				if_block_4.d();
				if_block_4 = null;
			}

			if (state.publish_error) {
				if (if_block_5) {
					if_block_5.p(changed, state);
				} else {
					if_block_5 = create_if_block_7(component, state);
					if_block_5.c();
					if_block_5.m(text_6.parentNode, text_6);
				}
			} else if (if_block_5) {
				if_block_5.u();
				if_block_5.d();
				if_block_5 = null;
			}

			if (state.publishing) {
				if (if_block_6) {
					if_block_6.p(changed, state);
				} else {
					if_block_6 = create_if_block_8(component, state);
					if_block_6.c();
					if_block_6.m(text_7.parentNode, text_7);
				}
			} else if (if_block_6) {
				if_block_6.u();
				if_block_6.d();
				if_block_6 = null;
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
						each_blocks[i_3].m(div_4, null);
					}
				}

				for (; i_3 < each_blocks.length; i_3 += 1) {
					each_blocks[i_3].u();
					each_blocks[i_3].d();
				}
				each_blocks.length = each_value.length;
			}

			if (changed.shareUrl) {
				text_16.data = state.shareUrl;
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
						each_1_blocks[i_3].m(div_10, null);
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

			if ((changed.copy_success) && div_12_class_value !== (div_12_class_value = "copy-success " + (state.copy_success ? 'show':'') + " svelte-178xnhw")) {
				div_12.className = div_12_class_value;
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
						each_2_blocks[i_3].m(div_13, null);
					}
				}

				for (; i_3 < each_2_blocks.length; i_3 += 1) {
					each_2_blocks[i_3].u();
					each_2_blocks[i_3].d();
				}
				each_2_blocks.length = each_value_2.length;
			}

			if ((changed.published) && div_class_value !== (div_class_value = state.published?'':'inactive')) {
				div.className = div_class_value;
			}
		},

		u: function unmount() {
			h2.innerHTML = '';

			b.innerHTML = '';

			detachAfter(raw_2_before);

			div_6.innerHTML = '';

			b_1.innerHTML = '';

			detachBefore(raw_5_after);

			if_block.u();
			detachNode(text);
			detachNode(button);
			if_block_1.u();
			detachNode(text_2);
			if (if_block_2) if_block_2.u();
			detachNode(text_3);
			if (if_block_3) if_block_3.u();
			detachNode(text_4);
			if (if_block_4) if_block_4.u();
			detachNode(text_5);
			if (if_block_5) if_block_5.u();
			detachNode(text_6);
			if (if_block_6) if_block_6.u();
			detachNode(text_7);
			detachNode(div);

			for (var i_3 = 0; i_3 < each_blocks.length; i_3 += 1) {
				each_blocks[i_3].u();
			}

			for (var i_3 = 0; i_3 < each_1_blocks.length; i_3 += 1) {
				each_1_blocks[i_3].u();
			}

			for (var i_3 = 0; i_3 < each_2_blocks.length; i_3 += 1) {
				each_2_blocks[i_3].u();
			}
		},

		d: function destroy$$1() {
			if_block.d();
			if_block_1.d();
			removeListener(button, "click", click_handler);
			if (if_block_2) if_block_2.d();
			if (if_block_3) if_block_3.d();
			if (if_block_4) if_block_4.d();
			if (if_block_5) if_block_5.d();
			if (if_block_6) if_block_6.d();
			component._bindingGroups[0].splice(component._bindingGroups[0].indexOf(input), 1);
			removeListener(input, "change", input_change_handler);

			destroyEach(each_blocks);

			help.destroy(false);

			destroyEach(each_1_blocks);

			if (component.refs.embedInput === input_1) component.refs.embedInput = null;
			removeListener(button_1, "click", click_handler_1);

			destroyEach(each_2_blocks);

			help_1.destroy(false);
		}
	};
}

// (1:0) {#if published}
function create_if_block$1(component, state) {
	var p, raw_value = __('publish / republish-intro');

	return {
		c: function create() {
			p = createElement("p");
		},

		m: function mount(target, anchor) {
			insertNode(p, target, anchor);
			p.innerHTML = raw_value;
		},

		u: function unmount() {
			p.innerHTML = '';

			detachNode(p);
		},

		d: noop
	};
}

// (3:0) {:else}
function create_if_block_1(component, state) {
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

		u: function unmount() {
			p.innerHTML = '';

			detachNode(p);
		},

		d: noop
	};
}

// (8:4) {#if published}
function create_if_block_2(component, state) {
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
			i.className = i_class_value = "fa fa-fw fa-refresh " + (state.publishing ? 'fa-spin' : '') + " svelte-178xnhw";
			span_1.className = "title svelte-178xnhw";
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
			if ((changed.publishing) && i_class_value !== (i_class_value = "fa fa-fw fa-refresh " + (state.publishing ? 'fa-spin' : '') + " svelte-178xnhw")) {
				i.className = i_class_value;
			}
		},

		u: function unmount() {
			detachNode(span);
		},

		d: noop
	};
}

// (10:4) {:else}
function create_if_block_3(component, state) {
	var span, i, i_class_value, text, span_1, text_1_value = __('publish / publish-btn'), text_1;

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
			i.className = i_class_value = "fa fa-fw " + (state.publishing ? 'fa-refresh fa-spin' : 'fa-cloud-upload') + " svelte-178xnhw";
			span_1.className = "title svelte-178xnhw";
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
			if ((changed.publishing) && i_class_value !== (i_class_value = "fa fa-fw " + (state.publishing ? 'fa-refresh fa-spin' : 'fa-cloud-upload') + " svelte-178xnhw")) {
				i.className = i_class_value;
			}
		},

		u: function unmount() {
			detachNode(span);
		},

		d: noop
	};
}

// (16:0) {#if !published}
function create_if_block_4(component, state) {
	var div, div_1, text_1, div_2, raw_value = __('publish / publish-btn-intro');

	return {
		c: function create() {
			div = createElement("div");
			div_1 = createElement("div");
			div_1.innerHTML = "<i class=\"fa fa-chevron-left\"></i>";
			text_1 = createText("\n    ");
			div_2 = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div_1.className = "arrow svelte-178xnhw";
			div_2.className = "text svelte-178xnhw";
			div.className = "publish-intro svelte-178xnhw";
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

// (28:0) {#if needs_republish && !publishing}
function create_if_block_5(component, state) {
	var div, raw_value = __('publish / republish-alert');

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div.className = "btn-aside alert svelte-178xnhw";
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

// (33:0) {#if published && !needs_republish && progress == 1 && !publishing}
function create_if_block_6(component, state) {
	var div, raw_value = __('publish / publish-success');

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div.className = "alert alert-success";
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

// (39:0) {#if publish_error}
function create_if_block_7(component, state) {
	var div;

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div.className = "alert alert-error";
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

// (45:0) {#if publishing}
function create_if_block_8(component, state) {
	var div, text_value = __("publish / progress / please-wait"), text, text_1, div_1, div_2, div_2_class_value, div_class_value;

	return {
		c: function create() {
			div = createElement("div");
			text = createText(text_value);
			text_1 = createText("\n    ");
			div_1 = createElement("div");
			div_2 = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div_2.className = div_2_class_value = "bar " + (state.progress < 1 ? '' : 'bar-success') + " svelte-178xnhw";
			div_1.className = "progress progress-striped active svelte-178xnhw";
			div.className = div_class_value = "alert " + (state.progress < 1 ? 'alert-info' : 'alert-success') + " publishing" + " svelte-178xnhw";
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
			if ((changed.progress) && div_2_class_value !== (div_2_class_value = "bar " + (state.progress < 1 ? '' : 'bar-success') + " svelte-178xnhw")) {
				div_2.className = div_2_class_value;
			}

			if ((changed.progress) && div_class_value !== (div_class_value = "alert " + (state.progress < 1 ? 'alert-info' : 'alert-success') + " publishing" + " svelte-178xnhw")) {
				div.className = div_class_value;
			}
		},

		u: function unmount() {
			detachNode(div);
		},

		d: function destroy$$1() {
			if (component.refs.bar === div_2) component.refs.bar = null;
		}
	};
}

// (63:20) {#each plugin_shareurls as tpl}
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
			input.className = "svelte-178xnhw";
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

// (83:20) {#each embed_templates as tpl}
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
			input.className = "svelte-178xnhw";
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

// (98:16) {#each embed_templates.slice(2) as tpl}
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

function App(options) {
	this._debugName = '<App>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this.refs = {};
	this._state = assign(data$1(), options.data);
	this._recompute({ shareurl_type: 1, chart: 1, plugin_shareurls: 1, published: 1, embed_type: 1 }, this._state);
	if (!('shareurl_type' in this._state)) console.warn("<App> was created without expected data property 'shareurl_type'");
	if (!('chart' in this._state)) console.warn("<App> was created without expected data property 'chart'");
	if (!('plugin_shareurls' in this._state)) console.warn("<App> was created without expected data property 'plugin_shareurls'");
	if (!('published' in this._state)) console.warn("<App> was created without expected data property 'published'");
	if (!('embed_type' in this._state)) console.warn("<App> was created without expected data property 'embed_type'");
	if (!('publishing' in this._state)) console.warn("<App> was created without expected data property 'publishing'");
	if (!('needs_republish' in this._state)) console.warn("<App> was created without expected data property 'needs_republish'");
	if (!('progress' in this._state)) console.warn("<App> was created without expected data property 'progress'");
	if (!('publish_error' in this._state)) console.warn("<App> was created without expected data property 'publish_error'");

	if (!('embed_templates' in this._state)) console.warn("<App> was created without expected data property 'embed_templates'");

	if (!('copy_success' in this._state)) console.warn("<App> was created without expected data property 'copy_success'");
	this._bindingGroups = [[], []];

	this._handlers.state = [onstate];

	var self = this;
	var _oncreate = function() {
		var changed = { shareurl_type: 1, chart: 1, plugin_shareurls: 1, published: 1, embed_type: 1, publishing: 1, needs_republish: 1, progress: 1, publish_error: 1, shareUrl: 1, embed_templates: 1, embedCode: 1, copy_success: 1 };
		onstate.call(self, { changed: changed, current: self._state });
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
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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
assign(App.prototype, methods$1);

App.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('shareUrl' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'shareUrl'");
	if ('embedCode' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'embedCode'");
};

App.prototype._recompute = function _recompute(changed, state) {
	if (changed.shareurl_type || changed.chart || changed.plugin_shareurls || changed.published) {
		if (this._differs(state.shareUrl, (state.shareUrl = shareUrl(state)))) changed.shareUrl = true;
	}

	if (changed.embed_type || changed.chart) {
		if (this._differs(state.embedCode, (state.embedCode = embedCode(state)))) changed.embedCode = true;
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
		var state = {};
		for (var i = 0; i < props.length; i += 1) {
			var prop = props[i];
			state['$' + prop] = this._state[prop];
		}
		return state;
	},

	_remove: function(component) {
		var i = this._dependents.length;
		while (i--) {
			if (this._dependents[i].component === component) {
				this._dependents.splice(i, 1);
				return;
			}
		}
	},

	_sortComputedProperties: function() {
		var computed = this._computed;
		var sorted = this._sortedComputedProperties = [];
		var cycles;
		var visited = blankObject();

		function visit(key) {
			if (cycles[key]) {
				throw new Error('Cyclical dependency detected');
			}

			if (visited[key]) return;
			visited[key] = true;

			var c = computed[key];

			if (c) {
				cycles[key] = true;
				c.deps.forEach(visit);
				sorted.push(c);
			}
		}

		for (var key in this._computed) {
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
					if (dep in changed) dirty = true;
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
		var oldState = this._state,
			changed = this._changed = {},
			dirty = false;

		for (var key in newState) {
			if (this._computed[key]) throw new Error("'" + key + "' is a read-only property");
			if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
		}
		if (!dirty) return;

		this._state = assign(assign({}, oldState), newState);

		for (var i = 0; i < this._sortedComputedProperties.length; i += 1) {
			this._sortedComputedProperties[i].update(this._state, changed);
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
					componentState['$' + prop] = this._state[prop];
					dirty = true;
				}
			}

			if (dirty) dependent.component.set(componentState);
		}

		this.fire('update', {
			changed: changed,
			current: this._state,
			previous: oldState
		});
	}
});

const store = new Store({});

const data$2 = {
    chart: {
        id: ''
    },
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
    copy_success: false
};

var main = { App, store, data: data$2 };

return main;

})));
