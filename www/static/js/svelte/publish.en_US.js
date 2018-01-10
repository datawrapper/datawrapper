var publish = (function () {
'use strict';

function noop() {}

function assign(target) {
	var k,
		source,
		i = 1,
		len = arguments.length;
	for (; i < len; i++) {
		source = arguments[i];
		for (k in source) target[k] = source[k];
	}

	return target;
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

function destroyEach(iterations) {
	for (var i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d();
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

function differs(a, b) {
	return a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function dispatchObservers(component, group, changed, newState, oldState) {
	for (var key in group) {
		if (!changed[key]) continue;

		var newValue = newState[key];
		var oldValue = oldState[key];

		var callbacks = group[key];
		if (!callbacks) continue;

		for (var i = 0; i < callbacks.length; i += 1) {
			var callback = callbacks[i];
			if (callback.__calling) continue;

			callback.__calling = true;
			callback.call(component, newValue, oldValue);
			callback.__calling = false;
		}
	}
}

function fire(eventName, data) {
	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) return;

	for (var i = 0; i < handlers.length; i += 1) {
		handlers[i].call(this, data);
	}
}

function get(key) {
	return key ? this._state[key] : this._state;
}

function init(component, options) {
	component._observers = { pre: blankObject(), post: blankObject() };
	component._handlers = blankObject();
	component._bind = options._bind;

	component.options = options;
	component.root = options.root || component;
	component.store = component.root.store || options.store;
}

function observe(key, callback, options) {
	var group = options && options.defer
		? this._observers.post
		: this._observers.pre;

	(group[key] || (group[key] = [])).push(callback);

	if (!options || options.init !== false) {
		callback.__calling = true;
		callback.call(this, this._state[key]);
		callback.__calling = false;
	}

	return {
		cancel: function() {
			var index = group[key].indexOf(callback);
			if (~index) group[key].splice(index, 1);
		}
	};
}

function observeDev(key, callback, options) {
	var c = (key = '' + key).search(/[^\w]/);
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
		if (differs(newState[key], oldState[key])) changed[key] = dirty = true;
	}
	if (!dirty) return;

	this._state = assign({}, oldState, newState);
	this._recompute(changed, this._state);
	if (this._bind) this._bind(changed, this._state);

	if (this._fragment) {
		dispatchObservers(this, this._observers.pre, changed, this._state, oldState);
		this._fragment.p(changed, this._state);
		dispatchObservers(this, this._observers.post, changed, this._state, oldState);
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
	while (fns && fns.length) fns.pop()();
}

function _mount(target, anchor) {
	this._fragment.m(target, anchor);
}

function _unmount() {
	if (this._fragment) this._fragment.u();
}

var protoDev = {
	destroy: destroyDev,
	get: get,
	fire: fire,
	observe: observeDev,
	on: onDev,
	set: setDev,
	teardown: destroyDev,
	_recompute: noop,
	_set: _set,
	_mount: _mount,
	_unmount: _unmount
};

function fetchJSON(url, method, body, callback) {
    window.fetch(url, {
        credentials: 'include',
        method: method,
        body: body
    })
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

function getJSON(url, callback) { return fetchJSON(url, 'GET', null, callback); }
function postJSON(url, body, callback) { return fetchJSON(url, 'POST', body, callback); }

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

    return embedHeights;
}

/* publish/App.html generated by Svelte v1.50.1 */
var fakeProgress = 0;

function shareUrl(shareurl_type, chart) {
    return shareurl_type == 'standalone' ?
        `https://www.datawrapper.de/_/${chart.id}` :
        chart.publicUrl ||
        `https://datawrapper.dwcdn.net/${chart.id}/${chart.publicVersion}/`;
}

function embedCode(embed_type, chart) {
    if (!chart.metadata || !chart.metadata.publish || !chart.metadata.publish['embed-codes']) return '';
    return chart.metadata.publish['embed-codes']['embed-method-'+embed_type];
}

var methods = {

    publish () {
        const me = this;
        const chart = me.get('chart');
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
        const chart = me.get('chart');
        fakeProgress += 0.05;
        getJSON(`/api/charts/${chart.id}/publish/status`, (res) => {
            if (res) {
                res = (+res / 100) + fakeProgress;
                me.set({progress: Math.min(1,res)});
            }
            if (me.get('publishing')) {
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

function oncreate() {
    const me = this;
    me.observe('publishing', (p) => {
        if (p) me.updateProgressBar(me.get('progress'));
    });
    me.observe('progress', (p) => {
        me.updateProgressBar(p);
    });
    // persist embed_type and shareurl
    me.observe('embed_type', (v) => {
        const data = window.dw.backend.__userData;
        if (!v || !data) return;
        data.embed_type = v;
        window.dw.backend.setUserData(data);
    });

    me.observe('shareurl_type', (v) => {
        const data = window.dw.backend.__userData;
        if (!v || !data) return;
        data.shareurl_type = v;
        window.dw.backend.setUserData(data);
    });
}

function encapsulateStyles(node) {
	setAttribute(node, "svelte-1817360291", "");
}

function create_main_fragment(state, component) {
	var h2, raw_value = "Publish to Share & Embed", text, text_1, button, text_3, text_4, text_5, text_6, text_7, if_block_6_anchor;

	var current_block_type = select_block_type(state);
	var if_block = current_block_type(state, component);

	var current_block_type_1 = select_block_type_1(state);
	var if_block_1 = current_block_type_1(state, component);

	function click_handler(event) {
		component.publish();
	}

	var if_block_2 = (state.needs_republish && !state.publishing) && create_if_block_4(state, component);

	var if_block_3 = (state.published && !state.needs_republish && state.progress == 1 && !state.publishing) && create_if_block_5(state, component);

	var if_block_4 = (state.publish_error) && create_if_block_6(state, component);

	var if_block_5 = (state.publishing) && create_if_block_7(state, component);

	var if_block_6 = (state.published) && create_if_block_8(state, component);

	return {
		c: function create() {
			h2 = createElement("h2");
			text = createText("\n\n");
			if_block.c();
			text_1 = createText("\n\n");
			button = createElement("button");
			if_block_1.c();
			text_3 = createText("\n\n");
			if (if_block_2) if_block_2.c();
			text_4 = createText("\n");
			if (if_block_3) if_block_3.c();
			text_5 = createText("\n\n");
			if (if_block_4) if_block_4.c();
			text_6 = createText("\n\n");
			if (if_block_5) if_block_5.c();
			text_7 = createText("\n\n");
			if (if_block_6) if_block_6.c();
			if_block_6_anchor = createComment();
			this.h();
		},

		h: function hydrate() {
			button.disabled = state.publishing;
			button.className = "btn-publish btn btn-primary btn-large";
			addListener(button, "click", click_handler);
		},

		m: function mount(target, anchor) {
			insertNode(h2, target, anchor);
			h2.innerHTML = raw_value;
			insertNode(text, target, anchor);
			if_block.m(target, anchor);
			insertNode(text_1, target, anchor);
			insertNode(button, target, anchor);
			if_block_1.m(button, null);
			insertNode(text_3, target, anchor);
			if (if_block_2) if_block_2.m(target, anchor);
			insertNode(text_4, target, anchor);
			if (if_block_3) if_block_3.m(target, anchor);
			insertNode(text_5, target, anchor);
			if (if_block_4) if_block_4.m(target, anchor);
			insertNode(text_6, target, anchor);
			if (if_block_5) if_block_5.m(target, anchor);
			insertNode(text_7, target, anchor);
			if (if_block_6) if_block_6.m(target, anchor);
			insertNode(if_block_6_anchor, target, anchor);
		},

		p: function update(changed, state) {
			if (current_block_type !== (current_block_type = select_block_type(state))) {
				if_block.u();
				if_block.d();
				if_block = current_block_type(state, component);
				if_block.c();
				if_block.m(text_1.parentNode, text_1);
			}

			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(state)) && if_block_1) {
				if_block_1.p(changed, state);
			} else {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = current_block_type_1(state, component);
				if_block_1.c();
				if_block_1.m(button, null);
			}

			if (changed.publishing) {
				button.disabled = state.publishing;
			}

			if (state.needs_republish && !state.publishing) {
				if (!if_block_2) {
					if_block_2 = create_if_block_4(state, component);
					if_block_2.c();
					if_block_2.m(text_4.parentNode, text_4);
				}
			} else if (if_block_2) {
				if_block_2.u();
				if_block_2.d();
				if_block_2 = null;
			}

			if (state.published && !state.needs_republish && state.progress == 1 && !state.publishing) {
				if (!if_block_3) {
					if_block_3 = create_if_block_5(state, component);
					if_block_3.c();
					if_block_3.m(text_5.parentNode, text_5);
				}
			} else if (if_block_3) {
				if_block_3.u();
				if_block_3.d();
				if_block_3 = null;
			}

			if (state.publish_error) {
				if (if_block_4) {
					if_block_4.p(changed, state);
				} else {
					if_block_4 = create_if_block_6(state, component);
					if_block_4.c();
					if_block_4.m(text_6.parentNode, text_6);
				}
			} else if (if_block_4) {
				if_block_4.u();
				if_block_4.d();
				if_block_4 = null;
			}

			if (state.publishing) {
				if (if_block_5) {
					if_block_5.p(changed, state);
				} else {
					if_block_5 = create_if_block_7(state, component);
					if_block_5.c();
					if_block_5.m(text_7.parentNode, text_7);
				}
			} else if (if_block_5) {
				if_block_5.u();
				if_block_5.d();
				if_block_5 = null;
			}

			if (state.published) {
				if (if_block_6) {
					if_block_6.p(changed, state);
				} else {
					if_block_6 = create_if_block_8(state, component);
					if_block_6.c();
					if_block_6.m(if_block_6_anchor.parentNode, if_block_6_anchor);
				}
			} else if (if_block_6) {
				if_block_6.u();
				if_block_6.d();
				if_block_6 = null;
			}
		},

		u: function unmount() {
			h2.innerHTML = '';

			detachNode(h2);
			detachNode(text);
			if_block.u();
			detachNode(text_1);
			detachNode(button);
			if_block_1.u();
			detachNode(text_3);
			if (if_block_2) if_block_2.u();
			detachNode(text_4);
			if (if_block_3) if_block_3.u();
			detachNode(text_5);
			if (if_block_4) if_block_4.u();
			detachNode(text_6);
			if (if_block_5) if_block_5.u();
			detachNode(text_7);
			if (if_block_6) if_block_6.u();
			detachNode(if_block_6_anchor);
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
		}
	};
}

// (3:0) {{#if published}}
function create_if_block(state, component) {
	var p, raw_value = "This chart has been published! If you make changes to the chart you will need to re-publish them.";

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

// (5:0) {{else}}
function create_if_block_1(state, component) {
	var p, raw_value = "To <b>share</b> your chart or or <b>embed it to your website or CMS</b> you need to publish it. It will only be visible to people who know the chart URL.";

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

// (10:4) {{#if published}}
function create_if_block_2(state, component) {
	var span, i, i_class_value, text, text_1_value = "Re-publish chart", text_1;

	return {
		c: function create() {
			span = createElement("span");
			i = createElement("i");
			text = createText(" ");
			text_1 = createText(text_1_value);
			this.h();
		},

		h: function hydrate() {
			encapsulateStyles(i);
			i.className = i_class_value = "fa fa-fw fa-refresh " + (state.publishing ? 'fa-spin' : '');
			span.className = "re-publish";
		},

		m: function mount(target, anchor) {
			insertNode(span, target, anchor);
			appendNode(i, span);
			appendNode(text, span);
			appendNode(text_1, span);
		},

		p: function update(changed, state) {
			if ((changed.publishing) && i_class_value !== (i_class_value = "fa fa-fw fa-refresh " + (state.publishing ? 'fa-spin' : ''))) {
				i.className = i_class_value;
			}
		},

		u: function unmount() {
			detachNode(span);
		},

		d: noop
	};
}

// (12:4) {{else}}
function create_if_block_3(state, component) {
	var span, i, i_class_value, text, text_1_value = "Publish chart", text_1;

	return {
		c: function create() {
			span = createElement("span");
			i = createElement("i");
			text = createText(" ");
			text_1 = createText(text_1_value);
			this.h();
		},

		h: function hydrate() {
			encapsulateStyles(i);
			i.className = i_class_value = "fa fa-fw " + (state.publishing ? 'fa-refresh fa-spin' : 'fa-cloud-upload');
			span.className = "publish";
		},

		m: function mount(target, anchor) {
			insertNode(span, target, anchor);
			appendNode(i, span);
			appendNode(text, span);
			appendNode(text_1, span);
		},

		p: function update(changed, state) {
			if ((changed.publishing) && i_class_value !== (i_class_value = "fa fa-fw " + (state.publishing ? 'fa-refresh fa-spin' : 'fa-cloud-upload'))) {
				i.className = i_class_value;
			}
		},

		u: function unmount() {
			detachNode(span);
		},

		d: noop
	};
}

// (17:0) {{#if needs_republish && !publishing}}
function create_if_block_4(state, component) {
	var div, raw_value = "You have changed the chart after its last publication. To make these changes show up you got to <b>publish the chart again</b>.";

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			encapsulateStyles(div);
			div.className = "btn-aside alert";
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

// (22:0) {{#if published && !needs_republish && progress == 1 && !publishing}}
function create_if_block_5(state, component) {
	var div, raw_value = "Congratulations, your chart can now be shared and embedded on your site.";

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

// (28:0) {{#if publish_error}}
function create_if_block_6(state, component) {
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

// (34:0) {{#if publishing}}
function create_if_block_7(state, component) {
	var div, text_value = "Your chart is now being prepared for publication and should be ready in a few seconds.", text, text_1, div_1, div_2, div_2_class_value, div_class_value;

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
			encapsulateStyles(div);
			encapsulateStyles(div_1);
			encapsulateStyles(div_2);
			div_2.className = div_2_class_value = "bar " + (state.progress < 1 ? '' : 'bar-success');
			div_1.className = "progress progress-striped active";
			div.className = div_class_value = "alert " + (state.progress < 1 ? 'alert-info' : 'alert-success') + " publishing";
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
			if ((changed.progress) && div_2_class_value !== (div_2_class_value = "bar " + (state.progress < 1 ? '' : 'bar-success'))) {
				div_2.className = div_2_class_value;
			}

			if ((changed.progress) && div_class_value !== (div_class_value = "alert " + (state.progress < 1 ? 'alert-info' : 'alert-success') + " publishing")) {
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

// (71:20) {{#each embed_templates as tpl}}
function create_each_block(state, embed_templates, tpl, tpl_index, component) {
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
			encapsulateStyles(input);
			component._bindingGroups[1].push(input);
			addListener(input, "change", input_change_handler);
			input.type = "radio";
			input.__value = input_value_value = tpl.id;
			input.value = input.__value;
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

		p: function update(changed, state, embed_templates, tpl, tpl_index) {
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

// (87:16) {{#each embed_templates.slice(2) as tpl}}
function create_each_block_1(state, each_value, tpl_1, tpl_index_1, component) {
	var div, b, text_value = tpl_1.title, text, text_1, text_2, raw_value = tpl_1.text, raw_before;

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

		p: function update(changed, state, each_value, tpl_1, tpl_index_1) {
			if ((changed.embed_templates) && text_value !== (text_value = tpl_1.title)) {
				text.data = text_value;
			}

			if ((changed.embed_templates) && raw_value !== (raw_value = tpl_1.text)) {
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

// (43:0) {{#if published}}
function create_if_block_8(state, component) {
	var div, div_1, i, text, div_2, div_3, b, raw_value = "Share via URL", text_1, label, input, text_2, raw_1_value = "normal size", raw_1_before, text_3, label_1, input_1, text_4, raw_2_value = "fullscreen", raw_2_before, text_6, div_4, a, text_7, text_10, div_5, span, text_12, div_6, raw_3_value = "The <b>normal size</b> URL displays the chart exactly the size you created it, and is useful for sharing on social media sites. The <b>fullscreen</b> URL will show your chart sized to fill the entire browser window.", text_16, div_7, i_1, text_17, div_8, div_9, b_1, raw_4_value = "Copy Embed code", text_18, div_10, text_21, div_11, input_2, text_22, button, i_2, text_23, text_24_value = "copy", text_24, text_25, div_12, text_26_value = "Embed code was copied to clipboard!", text_26, div_12_class_value, text_30, div_13, span_1, text_32, div_14, raw_5_value = "Copy and paste this HTML code into your website or CMS to embed your chart. The <b>responsive iframe</b> automatically adjusts its height to fit both headline and chart on different devices.", raw_5_after, text_33;

	function input_change_handler() {
		component.set({ shareurl_type: input.__value });
	}

	function input_1_change_handler() {
		component.set({ shareurl_type: input_1.__value });
	}

	var embed_templates = state.embed_templates;

	var each_blocks = [];

	for (var i_3 = 0; i_3 < embed_templates.length; i_3 += 1) {
		each_blocks[i_3] = create_each_block(state, embed_templates, embed_templates[i_3], i_3, component);
	}

	function click_handler(event) {
		var state = component.get();
		component.copy(state.embedCode);
	}

	var each_value = state.embed_templates.slice(2);

	var each_1_blocks = [];

	for (var i_3 = 0; i_3 < each_value.length; i_3 += 1) {
		each_1_blocks[i_3] = create_each_block_1(state, each_value, each_value[i_3], i_3, component);
	}

	return {
		c: function create() {
			div = createElement("div");
			div_1 = createElement("div");
			i = createElement("i");
			text = createText("\n        ");
			div_2 = createElement("div");
			div_3 = createElement("div");
			b = createElement("b");
			text_1 = createText("\n                ");
			label = createElement("label");
			input = createElement("input");
			text_2 = createText(" ");
			raw_1_before = createElement('noscript');
			text_3 = createText("\n                ");
			label_1 = createElement("label");
			input_1 = createElement("input");
			text_4 = createText(" ");
			raw_2_before = createElement('noscript');
			text_6 = createText("\n            ");
			div_4 = createElement("div");
			a = createElement("a");
			text_7 = createText(state.shareUrl);
			text_10 = createText("\n        ");
			div_5 = createElement("div");
			span = createElement("span");
			span.textContent = "?";
			text_12 = createText("\n            ");
			div_6 = createElement("div");
			text_16 = createText("\n\n    ");
			div_7 = createElement("div");
			i_1 = createElement("i");
			text_17 = createText("\n        ");
			div_8 = createElement("div");
			div_9 = createElement("div");
			b_1 = createElement("b");
			text_18 = createText("\n                ");
			div_10 = createElement("div");

			for (var i_3 = 0; i_3 < each_blocks.length; i_3 += 1) {
				each_blocks[i_3].c();
			}

			text_21 = createText("\n            ");
			div_11 = createElement("div");
			input_2 = createElement("input");
			text_22 = createText(" ");
			button = createElement("button");
			i_2 = createElement("i");
			text_23 = createText(" ");
			text_24 = createText(text_24_value);
			text_25 = createText("\n                ");
			div_12 = createElement("div");
			text_26 = createText(text_26_value);
			text_30 = createText("\n        ");
			div_13 = createElement("div");
			span_1 = createElement("span");
			span_1.textContent = "?";
			text_32 = createText("\n            ");
			div_14 = createElement("div");
			raw_5_after = createElement('noscript');
			text_33 = createText("\n                ");

			for (var i_3 = 0; i_3 < each_1_blocks.length; i_3 += 1) {
				each_1_blocks[i_3].c();
			}
			this.h();
		},

		h: function hydrate() {
			i.className = "icon fa fa-link fa-fw";
			encapsulateStyles(input);
			component._bindingGroups[0].push(input);
			addListener(input, "change", input_change_handler);
			input.__value = "standalone";
			input.value = input.__value;
			input.type = "radio";
			input.name = "url-type";
			label.className = "radio";
			encapsulateStyles(input_1);
			component._bindingGroups[0].push(input_1);
			addListener(input_1, "change", input_1_change_handler);
			input_1.__value = "fullscreen";
			input_1.value = input_1.__value;
			input_1.type = "radio";
			input_1.name = "url-type";
			label_1.className = "radio";
			div_3.className = "h";
			encapsulateStyles(a);
			a.target = "_blank";
			a.className = "share-url";
			a.href = state.shareUrl;
			div_4.className = "inpt";
			div_2.className = "ctrls";
			div_6.className = "content";
			div_5.className = "help";
			div_1.className = "block";
			i_1.className = "icon fa fa-code fa-fw";
			div_10.className = "embed-options";
			div_9.className = "h";
			input_2.type = "text";
			input_2.className = "input embed-code";
			input_2.readOnly = true;
			input_2.value = state.embedCode;
			i_2.className = "fa fa-copy";
			button.className = "btn btn-copy";
			button.title = "copy";
			addListener(button, "click", click_handler);
			encapsulateStyles(div_12);
			div_12.className = div_12_class_value = "copy-success " + (state.copy_success ? 'show':'');
			div_11.className = "inpt";
			div_8.className = "ctrls";
			div_14.className = "content";
			div_13.className = "help";
			div_7.className = "block";
			setStyle(div, "margin-top", "20px");
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(div_1, div);
			appendNode(i, div_1);
			appendNode(text, div_1);
			appendNode(div_2, div_1);
			appendNode(div_3, div_2);
			appendNode(b, div_3);
			b.innerHTML = raw_value;
			appendNode(text_1, div_3);
			appendNode(label, div_3);
			appendNode(input, label);

			input.checked = input.__value === state.shareurl_type;

			appendNode(text_2, label);
			appendNode(raw_1_before, label);
			raw_1_before.insertAdjacentHTML("afterend", raw_1_value);
			appendNode(text_3, div_3);
			appendNode(label_1, div_3);
			appendNode(input_1, label_1);

			input_1.checked = input_1.__value === state.shareurl_type;

			appendNode(text_4, label_1);
			appendNode(raw_2_before, label_1);
			raw_2_before.insertAdjacentHTML("afterend", raw_2_value);
			appendNode(text_6, div_2);
			appendNode(div_4, div_2);
			appendNode(a, div_4);
			appendNode(text_7, a);
			appendNode(text_10, div_1);
			appendNode(div_5, div_1);
			appendNode(span, div_5);
			appendNode(text_12, div_5);
			appendNode(div_6, div_5);
			div_6.innerHTML = raw_3_value;
			appendNode(text_16, div);
			appendNode(div_7, div);
			appendNode(i_1, div_7);
			appendNode(text_17, div_7);
			appendNode(div_8, div_7);
			appendNode(div_9, div_8);
			appendNode(b_1, div_9);
			b_1.innerHTML = raw_4_value;
			appendNode(text_18, div_9);
			appendNode(div_10, div_9);

			for (var i_3 = 0; i_3 < each_blocks.length; i_3 += 1) {
				each_blocks[i_3].m(div_10, null);
			}

			appendNode(text_21, div_8);
			appendNode(div_11, div_8);
			appendNode(input_2, div_11);
			component.refs.embedInput = input_2;
			appendNode(text_22, div_11);
			appendNode(button, div_11);
			appendNode(i_2, button);
			appendNode(text_23, button);
			appendNode(text_24, button);
			appendNode(text_25, div_11);
			appendNode(div_12, div_11);
			appendNode(text_26, div_12);
			appendNode(text_30, div_7);
			appendNode(div_13, div_7);
			appendNode(span_1, div_13);
			appendNode(text_32, div_13);
			appendNode(div_14, div_13);
			appendNode(raw_5_after, div_14);
			raw_5_after.insertAdjacentHTML("beforebegin", raw_5_value);
			appendNode(text_33, div_14);

			for (var i_3 = 0; i_3 < each_1_blocks.length; i_3 += 1) {
				each_1_blocks[i_3].m(div_14, null);
			}
		},

		p: function update(changed, state) {
			input.checked = input.__value === state.shareurl_type;
			input_1.checked = input_1.__value === state.shareurl_type;
			if (changed.shareUrl) {
				text_7.data = state.shareUrl;
				a.href = state.shareUrl;
			}

			var embed_templates = state.embed_templates;

			if (changed.embed_type || changed.embed_templates) {
				for (var i_3 = 0; i_3 < embed_templates.length; i_3 += 1) {
					if (each_blocks[i_3]) {
						each_blocks[i_3].p(changed, state, embed_templates, embed_templates[i_3], i_3);
					} else {
						each_blocks[i_3] = create_each_block(state, embed_templates, embed_templates[i_3], i_3, component);
						each_blocks[i_3].c();
						each_blocks[i_3].m(div_10, null);
					}
				}

				for (; i_3 < each_blocks.length; i_3 += 1) {
					each_blocks[i_3].u();
					each_blocks[i_3].d();
				}
				each_blocks.length = embed_templates.length;
			}

			if (changed.embedCode) {
				input_2.value = state.embedCode;
			}

			if ((changed.copy_success) && div_12_class_value !== (div_12_class_value = "copy-success " + (state.copy_success ? 'show':''))) {
				div_12.className = div_12_class_value;
			}

			var each_value = state.embed_templates.slice(2);

			if (changed.embed_templates) {
				for (var i_3 = 0; i_3 < each_value.length; i_3 += 1) {
					if (each_1_blocks[i_3]) {
						each_1_blocks[i_3].p(changed, state, each_value, each_value[i_3], i_3);
					} else {
						each_1_blocks[i_3] = create_each_block_1(state, each_value, each_value[i_3], i_3, component);
						each_1_blocks[i_3].c();
						each_1_blocks[i_3].m(div_14, null);
					}
				}

				for (; i_3 < each_1_blocks.length; i_3 += 1) {
					each_1_blocks[i_3].u();
					each_1_blocks[i_3].d();
				}
				each_1_blocks.length = each_value.length;
			}
		},

		u: function unmount() {
			b.innerHTML = '';

			detachAfter(raw_1_before);

			detachAfter(raw_2_before);

			div_6.innerHTML = '';

			b_1.innerHTML = '';

			detachBefore(raw_5_after);

			detachNode(div);

			for (var i_3 = 0; i_3 < each_blocks.length; i_3 += 1) {
				each_blocks[i_3].u();
			}

			for (var i_3 = 0; i_3 < each_1_blocks.length; i_3 += 1) {
				each_1_blocks[i_3].u();
			}
		},

		d: function destroy$$1() {
			component._bindingGroups[0].splice(component._bindingGroups[0].indexOf(input), 1);
			removeListener(input, "change", input_change_handler);
			component._bindingGroups[0].splice(component._bindingGroups[0].indexOf(input_1), 1);
			removeListener(input_1, "change", input_1_change_handler);

			destroyEach(each_blocks);

			if (component.refs.embedInput === input_2) component.refs.embedInput = null;
			removeListener(button, "click", click_handler);

			destroyEach(each_1_blocks);
		}
	};
}

function select_block_type(state) {
	if (state.published) return create_if_block;
	return create_if_block_1;
}

function select_block_type_1(state) {
	if (state.published) return create_if_block_2;
	return create_if_block_3;
}

function App(options) {
	this._debugName = '<App>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this.refs = {};
	this._state = assign({}, options.data);
	this._recompute({ shareurl_type: 1, chart: 1, embed_type: 1 }, this._state);
	if (!('shareurl_type' in this._state)) console.warn("<App> was created without expected data property 'shareurl_type'");
	if (!('chart' in this._state)) console.warn("<App> was created without expected data property 'chart'");
	if (!('embed_type' in this._state)) console.warn("<App> was created without expected data property 'embed_type'");
	if (!('published' in this._state)) console.warn("<App> was created without expected data property 'published'");
	if (!('publishing' in this._state)) console.warn("<App> was created without expected data property 'publishing'");
	if (!('needs_republish' in this._state)) console.warn("<App> was created without expected data property 'needs_republish'");
	if (!('progress' in this._state)) console.warn("<App> was created without expected data property 'progress'");
	if (!('publish_error' in this._state)) console.warn("<App> was created without expected data property 'publish_error'");
	if (!('shareUrl' in this._state)) console.warn("<App> was created without expected data property 'shareUrl'");
	if (!('embed_templates' in this._state)) console.warn("<App> was created without expected data property 'embed_templates'");
	if (!('embedCode' in this._state)) console.warn("<App> was created without expected data property 'embedCode'");
	if (!('copy_success' in this._state)) console.warn("<App> was created without expected data property 'copy_success'");
	this._bindingGroups = [[], []];

	var _oncreate = oncreate.bind(this);

	if (!options.root) {
		this._oncreate = [_oncreate];
	} else {
	 	this.root._oncreate.push(_oncreate);
	 }

	this._fragment = create_main_fragment(this._state, this);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);

		callAll(this._oncreate);
	}
}

assign(App.prototype, methods, protoDev);

App.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('shareUrl' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'shareUrl'");
	if ('embedCode' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'embedCode'");
};

App.prototype._recompute = function _recompute(changed, state) {
	if (changed.shareurl_type || changed.chart) {
		if (differs(state.shareUrl, (state.shareUrl = shareUrl(state.shareurl_type, state.chart)))) changed.shareUrl = true;
	}

	if (changed.embed_type || changed.chart) {
		if (differs(state.embedCode, (state.embedCode = embedCode(state.embed_type, state.chart)))) changed.embedCode = true;
	}
};

function Store(state) {
	this._observers = { pre: blankObject(), post: blankObject() };
	this._changeHandlers = [];
	this._dependents = [];

	this._computed = blankObject();
	this._sortedComputedProperties = [];

	this._state = assign({}, state);
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
					if (differs(newValue, value)) {
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

	get: get,

	observe: observe,

	onchange: function(callback) {
		this._changeHandlers.push(callback);
		return {
			cancel: function() {
				var index = this._changeHandlers.indexOf(callback);
				if (~index) this._changeHandlers.splice(index, 1);
			}
		};
	},

	set: function(newState) {
		var oldState = this._state,
			changed = this._changed = {},
			dirty = false;

		for (var key in newState) {
			if (this._computed[key]) throw new Error("'" + key + "' is a read-only property");
			if (differs(newState[key], oldState[key])) changed[key] = dirty = true;
		}
		if (!dirty) return;

		this._state = assign({}, oldState, newState);

		for (var i = 0; i < this._sortedComputedProperties.length; i += 1) {
			this._sortedComputedProperties[i].update(this._state, changed);
		}

		for (var i = 0; i < this._changeHandlers.length; i += 1) {
			this._changeHandlers[i](this._state, changed);
		}

		dispatchObservers(this, this._observers.pre, changed, this._state, oldState);

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

		dispatchObservers(this, this._observers.post, changed, this._state, oldState);
	}
});

const store = new Store({});

var app = new App({
    target: document.querySelector('.svelte-publish'),
    store: store,
    data: {
        chart: {
            id: ''
        },
        embed_templates: [],
        published: false,
        publishing: false,
        needs_republish: false,
        publish_error: false,
        progress: 0,
        shareurl_type: 'standalone',
        embed_type: 'responsive',
        copy_success: false
    }
});

return app;

}());
