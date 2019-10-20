(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('svelte/publish_old', factory) :
	(global = global || self, global.publish_old = factory());
}(this, function () { 'use strict';

	function noop() {}

	function assign(tar, src) {
		for (var k in src) tar[k] = src[k];
		return tar;
	}

	function assignTrue(tar, src) {
		for (var k in src) tar[k] = 1;
		return tar;
	}

	function addLoc(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
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

	function detachAfter(before) {
		while (before.nextSibling) {
			before.parentNode.removeChild(before.nextSibling);
		}
	}

	function reinsertChildren(parent, target) {
		while (parent.firstChild) target.appendChild(parent.firstChild);
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

	/* home/david/Projects/core/services/datawrapper/src/editor/Help.html generated by Svelte v2.16.1 */

	function data() {
	    return {
	        visible: false
	    };
	}
	var methods = {
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

	const file = "home/david/Projects/core/services/datawrapper/src/editor/Help.html";

	function create_main_fragment(component, ctx) {
		var div, span, text;

		function select_block_type(ctx) {
			if (ctx.visible) return create_if_block_1;
			return create_else_block;
		}

		var current_block_type = select_block_type(ctx);
		var if_block0 = current_block_type(component, ctx);

		var if_block1 = (ctx.visible) && create_if_block(component, ctx);

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
				if_block0.c();
				text = createText("\n    ");
				if (if_block1) if_block1.c();
				span.className = "svelte-1mkn8ur";
				addLoc(span, file, 1, 4, 69);
				addListener(div, "mouseenter", mouseenter_handler);
				addListener(div, "mouseleave", mouseleave_handler);
				div.className = "help svelte-1mkn8ur";
				addLoc(div, file, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, span);
				if_block0.m(span, null);
				append(div, text);
				if (if_block1) if_block1.m(div, null);
			},

			p: function update(changed, ctx) {
				if (current_block_type !== (current_block_type = select_block_type(ctx))) {
					if_block0.d(1);
					if_block0 = current_block_type(component, ctx);
					if_block0.c();
					if_block0.m(span, null);
				}

				if (ctx.visible) {
					if (!if_block1) {
						if_block1 = create_if_block(component, ctx);
						if_block1.c();
						if_block1.m(div, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if_block0.d();
				if (if_block1) if_block1.d();
				removeListener(div, "mouseenter", mouseenter_handler);
				removeListener(div, "mouseleave", mouseleave_handler);
			}
		};
	}

	// (2:59) {:else}
	function create_else_block(component, ctx) {
		var text;

		return {
			c: function create() {
				text = createText("?");
			},

			m: function mount(target, anchor) {
				insert(target, text, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(text);
				}
			}
		};
	}

	// (2:10) {#if visible}
	function create_if_block_1(component, ctx) {
		var i;

		return {
			c: function create() {
				i = createElement("i");
				i.className = "im im-graduation-hat svelte-1mkn8ur";
				addLoc(i, file, 1, 23, 88);
			},

			m: function mount(target, anchor) {
				insert(target, i, anchor);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(i);
				}
			}
		};
	}

	// (3:4) {#if visible}
	function create_if_block(component, ctx) {
		var div, slot_content_default = component._slotted.default;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "content svelte-1mkn8ur";
				addLoc(div, file, 3, 4, 167);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				if (slot_content_default) {
					append(div, slot_content_default);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (slot_content_default) {
					reinsertChildren(div, slot_content_default);
				}
			}
		};
	}

	function Help(options) {
		this._debugName = '<Help>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data(), options.data);
		if (!('visible' in this._state)) console.warn("<Help> was created without expected data property 'visible'");
		this._intro = true;

		this._slotted = options.slots || {};

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

	const dw = window.dw;

	function __(key, scope = 'core') {
	    key = key.trim();
	    if (!dw.backend.__messages[scope]) return 'MISSING:' + key;
	    var translation = dw.backend.__messages[scope][key] || dw.backend.__messages.core[key] || key;

	    if (arguments.length > 2) {
	        for (var i = 2; i < arguments.length; i++) {
	            var index = i - 1;
	            translation = translation.replace('$' + index, arguments[i]);
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
	        method,
	        body,
	        mode: 'cors',
	        credentials
	    };

	    const promise = window
	        .fetch(url, opts)
	        .then(res => {
	            if (res.status !== 200) return new Error(res.statusText);
	            return res.text();
	        })
	        .then(text => {
	            try {
	                return JSON.parse(text);
	            } catch (Error) {
	                // could not parse json, so just return text
	                console.warn('malformed json input', text);
	                return text;
	            }
	        })
	        .catch(err => {
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

	const widths = [100, 200, 300, 400, 500, 700, 800, 900, 1000];

	function computeEmbedHeights() {
	    const embedHeights = {};

	    // compute embed deltas
	    const $ = window.$;
	    const previewChart = $($('#iframe-vis')[0].contentDocument);
	    // find out default heights
	    const defaultHeight = $('h1', previewChart).height() + $('.chart-intro', previewChart).height() + $('.dw-chart-notes', previewChart).height();

	    const totalHeight = $('#iframe-vis').height();

	    widths.forEach(width => {
	        // now we resize headline, intro and footer
	        previewChart.find('h1,.chart-intro,.dw-chart-notes').css('width', width + 'px');

	        const height = $('h1', previewChart).height() + $('.chart-intro', previewChart).height() + $('.dw-chart-notes', previewChart).height();

	        embedHeights[width] = totalHeight + (height - defaultHeight);
	    });

	    previewChart.find('h1,.chart-intro,.dw-chart-notes').css('width', 'auto');

	    return embedHeights;
	}

	/* home/david/Projects/core/services/datawrapper/src/publish/App.html generated by Svelte v2.16.1 */



	let fakeProgress = 0;
	let initial_auto_publish = true;

	function shareUrl({ shareurl_type, chart, plugin_shareurls, published }) {
	    if (!published) return 'https://www.datawrapper.de/...';
	    if (shareurl_type === 'default') return chart.publicUrl;
	    let url = '';
	    plugin_shareurls.forEach(t => {
	        if (t.id === shareurl_type) url = t.url.replace(/%chart_id%/g, chart.id);
	    });
	    return url;
	}
	function embedCode({ embed_type, chart }) {
	    if (!chart.metadata) return '';
	    if (chart.metadata.publish && !chart.metadata.publish['embed-codes'])
	        return `<iframe src="${chart.publicUrl}" width="100%" height="${
            chart.metadata.publish['embed-height']
        }" scrolling="no" frameborder="0" allowtransparency="true"></iframe>`;
	    return chart.metadata.publish['embed-codes']['embed-method-' + embed_type];
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
	    };
	}
	var methods$1 = {
	    publish() {
	        const me = this;
	        // wait another 100ms until the page is ready
	        if (!window.chart.save) {
	            setTimeout(() => {
	                me.publish();
	            }, 100);
	            return;
	        }
	        const { chart } = me.get();

	        me.set({
	            publishing: true,
	            progress: 0,
	            publish_error: false
	        });
	        // generate embed codes
	        chart.metadata.publish['embed-heights'] = computeEmbedHeights(chart, me.get().embed_templates);

	        // update charts
	        me.set({ chart });
	        // save embed heights and wait until it's done before
	        // we start to publish the chart
	        trackEvent('Chart Editor', 'publish');

	        window.chart
	            .attributes(chart)
	            .save()
	            .then(d => {
	                // publish chart
	                postJSON(`/api/charts/${chart.id}/publish`, null, res => {
	                    if (res.status === 'ok') {
	                        trackEvent('Chart Editor', 'publish-success');
	                        me.publishFinished(res.data);
	                    } else {
	                        trackEvent('Chart Editor', 'publish-error', res.message);
	                        me.set({ publish_error: res.message });
	                    }
	                });
	                fakeProgress = 0;
	                me.updateStatus();
	            });
	    },

	    updateProgressBar(p) {
	        if (this.refs.bar) {
	            this.refs.bar.style.width = (p * 100).toFixed() + '%';
	        }
	    },

	    updateStatus() {
	        const me = this;
	        const { chart } = me.get();
	        fakeProgress += 0.05;
	        getJSON(`/api/charts/${chart.id}/publish/status`, res => {
	            if (res) {
	                res = +res / 100 + fakeProgress;
	                me.set({ progress: Math.min(1, res) });
	            }
	            if (me.get().publishing) {
	                setTimeout(() => {
	                    me.updateStatus();
	                }, 400);
	            }
	        });
	    },

	    publishFinished(chartInfo) {
	        this.set({
	            progress: 1,
	            published: true,
	            needs_republish: false
	        });
	        setTimeout(() => this.set({ publishing: false }), 500);
	        this.set({ chart: chartInfo });

	        if (window.parent) {
	            window.parent.postMessage(
	                {
	                    source: 'datawrapper',
	                    type: 'chart-publish',
	                    chartId: chartInfo.id
	                },
	                '*'
	            );
	        }

	        window.chart.attributes(chartInfo);
	    },

	    copy(embedCode) {
	        const me = this;
	        me.refs.embedInput.select();
	        try {
	            var successful = document.execCommand('copy');
	            if (successful) {
	                trackEvent('Chart Editor', 'embedcode-copy');
	                me.set({ copy_success: true });
	                setTimeout(() => me.set({ copy_success: false }), 300);
	            }
	        } catch (err) {
	            // console.log('Oops, unable to copy');
	        }
	    }
	};

	function onstate({ changed, current }) {
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
	const file$1 = "home/david/Projects/core/services/datawrapper/src/publish/App.html";

	function get_each2_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.tpl = list[i];
		return child_ctx;
	}

	function get_each1_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.tpl = list[i];
		return child_ctx;
	}

	function get_each0_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.tpl = list[i];
		return child_ctx;
	}

	function create_main_fragment$1(component, ctx) {
		var text0, button0, button0_class_value, text1, text2, text3, text4, text5, text6, div13, h2, raw0_value = __('publish / share-embed'), text7, div5, i0, text8, div3, div1, b0, raw1_value = __('publish / share-url'), text9, div0, label, input0, text10, raw2_value = __('publish / share-url / fullscreen'), raw2_before, text11, text12, div2, a, text13, text14, div4, raw3_value = __('publish / help / share-url'), text15, div12, i1, text16, div10, div7, b1, raw4_value = __('publish / embed'), text17, div6, text18, div9, input1, text19, button1, i2, text20, text21_value = __('publish / copy'), text21, text22, div8, text23_value = __('publish / copy-success'), text23, div8_class_value, text24, div11, raw5_value = __('publish / embed / help'), raw5_after, text25, div13_class_value;

		function select_block_type(ctx) {
			if (ctx.published) return create_if_block_6;
			return create_else_block_1;
		}

		var current_block_type = select_block_type(ctx);
		var if_block0 = current_block_type(component, ctx);

		function select_block_type_1(ctx) {
			if (ctx.published) return create_if_block_5;
			return create_else_block$1;
		}

		var current_block_type_1 = select_block_type_1(ctx);
		var if_block1 = current_block_type_1(component, ctx);

		function click_handler(event) {
			component.publish();
		}

		var if_block2 = (!ctx.published) && create_if_block_4(component, ctx);

		var if_block3 = (ctx.needs_republish && !ctx.publishing) && create_if_block_3(component, ctx);

		var if_block4 = (ctx.published && !ctx.needs_republish && ctx.progress === 1 && !ctx.publishing) && create_if_block_2(component, ctx);

		var if_block5 = (ctx.publish_error) && create_if_block_1$1(component, ctx);

		var if_block6 = (ctx.publishing) && create_if_block$1(component, ctx);

		function input0_change_handler() {
			component.set({ shareurl_type: input0.__value });
		}

		var each0_value = ctx.plugin_shareurls;

		var each0_blocks = [];

		for (var i = 0; i < each0_value.length; i += 1) {
			each0_blocks[i] = create_each_block_2(component, get_each0_context(ctx, each0_value, i));
		}

		var help0 = new Help({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() }
		});

		var each1_value = ctx.embed_templates;

		var each1_blocks = [];

		for (var i = 0; i < each1_value.length; i += 1) {
			each1_blocks[i] = create_each_block_1(component, get_each1_context(ctx, each1_value, i));
		}

		function click_handler_1(event) {
			component.copy(ctx.embedCode);
		}

		var each2_value = ctx.embed_templates.slice(2);

		var each2_blocks = [];

		for (var i = 0; i < each2_value.length; i += 1) {
			each2_blocks[i] = create_each_block(component, get_each2_context(ctx, each2_value, i));
		}

		var help1 = new Help({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() }
		});

		return {
			c: function create() {
				if_block0.c();
				text0 = createText("\n\n");
				button0 = createElement("button");
				if_block1.c();
				text1 = createText("\n\n");
				if (if_block2) if_block2.c();
				text2 = createText(" ");
				if (if_block3) if_block3.c();
				text3 = createText(" ");
				if (if_block4) if_block4.c();
				text4 = createText(" ");
				if (if_block5) if_block5.c();
				text5 = createText(" ");
				if (if_block6) if_block6.c();
				text6 = createText("\n\n");
				div13 = createElement("div");
				h2 = createElement("h2");
				text7 = createText("\n    ");
				div5 = createElement("div");
				i0 = createElement("i");
				text8 = createText("\n        ");
				div3 = createElement("div");
				div1 = createElement("div");
				b0 = createElement("b");
				text9 = createText("\n                ");
				div0 = createElement("div");
				label = createElement("label");
				input0 = createElement("input");
				text10 = createText("\n                        ");
				raw2_before = createElement('noscript');
				text11 = createText("\n                    ");

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].c();
				}

				text12 = createText("\n            ");
				div2 = createElement("div");
				a = createElement("a");
				text13 = createText(ctx.shareUrl);
				text14 = createText("\n        ");
				div4 = createElement("div");
				help0._fragment.c();
				text15 = createText("\n\n    ");
				div12 = createElement("div");
				i1 = createElement("i");
				text16 = createText("\n        ");
				div10 = createElement("div");
				div7 = createElement("div");
				b1 = createElement("b");
				text17 = createText("\n                ");
				div6 = createElement("div");

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].c();
				}

				text18 = createText("\n            ");
				div9 = createElement("div");
				input1 = createElement("input");
				text19 = createText("\n                ");
				button1 = createElement("button");
				i2 = createElement("i");
				text20 = createText(" ");
				text21 = createText(text21_value);
				text22 = createText("\n                ");
				div8 = createElement("div");
				text23 = createText(text23_value);
				text24 = createText("\n        ");
				div11 = createElement("div");
				raw5_after = createElement('noscript');
				text25 = createText(" ");

				for (var i = 0; i < each2_blocks.length; i += 1) {
					each2_blocks[i].c();
				}

				help1._fragment.c();
				addListener(button0, "click", click_handler);
				button0.disabled = ctx.publishing;
				button0.className = button0_class_value = "btn-publish btn btn-primary btn-large " + (ctx.published?'':'btn-first-publish') + " svelte-1ee9woc";
				addLoc(button0, file$1, 6, 0, 153);
				addLoc(h2, file$1, 50, 4, 1673);
				i0.className = "icon fa fa-link fa-fw";
				addLoc(i0, file$1, 52, 8, 1751);
				addLoc(b0, file$1, 55, 16, 1861);
				component._bindingGroups[0].push(input0);
				addListener(input0, "change", input0_change_handler);
				input0.__value = "default";
				input0.value = input0.__value;
				setAttribute(input0, "type", "radio");
				input0.name = "url-type";
				input0.className = "svelte-1ee9woc";
				addLoc(input0, file$1, 58, 24, 2013);
				label.className = "radio";
				addLoc(label, file$1, 57, 20, 1967);
				div0.className = "embed-options svelte-1ee9woc";
				addLoc(div0, file$1, 56, 16, 1919);
				div1.className = "h";
				addLoc(div1, file$1, 54, 12, 1829);
				a.target = "_blank";
				a.className = "share-url svelte-1ee9woc";
				a.href = ctx.shareUrl;
				addLoc(a, file$1, 67, 16, 2516);
				div2.className = "inpt";
				addLoc(div2, file$1, 66, 12, 2481);
				div3.className = "ctrls";
				addLoc(div3, file$1, 53, 8, 1797);
				addLoc(div4, file$1, 71, 12, 2647);
				div5.className = "block";
				addLoc(div5, file$1, 51, 4, 1723);
				i1.className = "icon fa fa-code fa-fw";
				addLoc(i1, file$1, 76, 8, 2760);
				addLoc(b1, file$1, 79, 16, 2870);
				div6.className = "embed-options svelte-1ee9woc";
				addLoc(div6, file$1, 80, 16, 2924);
				div7.className = "h";
				addLoc(div7, file$1, 78, 12, 2838);
				setAttribute(input1, "type", "text");
				input1.className = "input embed-code";
				input1.readOnly = true;
				input1.value = ctx.embedCode;
				addLoc(input1, file$1, 87, 16, 3252);
				i2.className = "fa fa-copy";
				addLoc(i2, file$1, 88, 85, 3428);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn btn-copy";
				button1.title = "copy";
				addLoc(button1, file$1, 88, 16, 3359);
				div8.className = div8_class_value = "copy-success " + (ctx.copy_success ? 'show':'') + " svelte-1ee9woc";
				addLoc(div8, file$1, 89, 16, 3505);
				div9.className = "inpt";
				addLoc(div9, file$1, 86, 12, 3217);
				div10.className = "ctrls";
				addLoc(div10, file$1, 77, 8, 2806);
				addLoc(div11, file$1, 95, 12, 3696);
				div12.className = "block";
				addLoc(div12, file$1, 75, 4, 2732);
				setStyle(div13, "margin-top", "20px");
				div13.className = div13_class_value = ctx.published?'':'inactive';
				addLoc(div13, file$1, 49, 0, 1605);
			},

			m: function mount(target, anchor) {
				if_block0.m(target, anchor);
				insert(target, text0, anchor);
				insert(target, button0, anchor);
				if_block1.m(button0, null);
				insert(target, text1, anchor);
				if (if_block2) if_block2.m(target, anchor);
				insert(target, text2, anchor);
				if (if_block3) if_block3.m(target, anchor);
				insert(target, text3, anchor);
				if (if_block4) if_block4.m(target, anchor);
				insert(target, text4, anchor);
				if (if_block5) if_block5.m(target, anchor);
				insert(target, text5, anchor);
				if (if_block6) if_block6.m(target, anchor);
				insert(target, text6, anchor);
				insert(target, div13, anchor);
				append(div13, h2);
				h2.innerHTML = raw0_value;
				append(div13, text7);
				append(div13, div5);
				append(div5, i0);
				append(div5, text8);
				append(div5, div3);
				append(div3, div1);
				append(div1, b0);
				b0.innerHTML = raw1_value;
				append(div1, text9);
				append(div1, div0);
				append(div0, label);
				append(label, input0);

				input0.checked = input0.__value === ctx.shareurl_type;

				append(label, text10);
				append(label, raw2_before);
				raw2_before.insertAdjacentHTML("afterend", raw2_value);
				append(div0, text11);

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].m(div0, null);
				}

				append(div3, text12);
				append(div3, div2);
				append(div2, a);
				append(a, text13);
				append(div5, text14);
				append(help0._slotted.default, div4);
				div4.innerHTML = raw3_value;
				help0._mount(div5, null);
				append(div13, text15);
				append(div13, div12);
				append(div12, i1);
				append(div12, text16);
				append(div12, div10);
				append(div10, div7);
				append(div7, b1);
				b1.innerHTML = raw4_value;
				append(div7, text17);
				append(div7, div6);

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].m(div6, null);
				}

				append(div10, text18);
				append(div10, div9);
				append(div9, input1);
				component.refs.embedInput = input1;
				append(div9, text19);
				append(div9, button1);
				append(button1, i2);
				append(button1, text20);
				append(button1, text21);
				append(div9, text22);
				append(div9, div8);
				append(div8, text23);
				append(div12, text24);
				append(help1._slotted.default, div11);
				append(div11, raw5_after);
				raw5_after.insertAdjacentHTML("beforebegin", raw5_value);
				append(div11, text25);

				for (var i = 0; i < each2_blocks.length; i += 1) {
					each2_blocks[i].m(div11, null);
				}

				help1._mount(div12, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (current_block_type !== (current_block_type = select_block_type(ctx))) {
					if_block0.d(1);
					if_block0 = current_block_type(component, ctx);
					if_block0.c();
					if_block0.m(text0.parentNode, text0);
				}

				if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type_1(component, ctx);
					if_block1.c();
					if_block1.m(button0, null);
				}

				if (changed.publishing) {
					button0.disabled = ctx.publishing;
				}

				if ((changed.published) && button0_class_value !== (button0_class_value = "btn-publish btn btn-primary btn-large " + (ctx.published?'':'btn-first-publish') + " svelte-1ee9woc")) {
					button0.className = button0_class_value;
				}

				if (!ctx.published) {
					if (!if_block2) {
						if_block2 = create_if_block_4(component, ctx);
						if_block2.c();
						if_block2.m(text2.parentNode, text2);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (ctx.needs_republish && !ctx.publishing) {
					if (!if_block3) {
						if_block3 = create_if_block_3(component, ctx);
						if_block3.c();
						if_block3.m(text3.parentNode, text3);
					}
				} else if (if_block3) {
					if_block3.d(1);
					if_block3 = null;
				}

				if (ctx.published && !ctx.needs_republish && ctx.progress === 1 && !ctx.publishing) {
					if (!if_block4) {
						if_block4 = create_if_block_2(component, ctx);
						if_block4.c();
						if_block4.m(text4.parentNode, text4);
					}
				} else if (if_block4) {
					if_block4.d(1);
					if_block4 = null;
				}

				if (ctx.publish_error) {
					if (if_block5) {
						if_block5.p(changed, ctx);
					} else {
						if_block5 = create_if_block_1$1(component, ctx);
						if_block5.c();
						if_block5.m(text5.parentNode, text5);
					}
				} else if (if_block5) {
					if_block5.d(1);
					if_block5 = null;
				}

				if (ctx.publishing) {
					if (if_block6) {
						if_block6.p(changed, ctx);
					} else {
						if_block6 = create_if_block$1(component, ctx);
						if_block6.c();
						if_block6.m(text6.parentNode, text6);
					}
				} else if (if_block6) {
					if_block6.d(1);
					if_block6 = null;
				}

				if (changed.shareurl_type) input0.checked = input0.__value === ctx.shareurl_type;

				if (changed.plugin_shareurls || changed.shareurl_type) {
					each0_value = ctx.plugin_shareurls;

					for (var i = 0; i < each0_value.length; i += 1) {
						const child_ctx = get_each0_context(ctx, each0_value, i);

						if (each0_blocks[i]) {
							each0_blocks[i].p(changed, child_ctx);
						} else {
							each0_blocks[i] = create_each_block_2(component, child_ctx);
							each0_blocks[i].c();
							each0_blocks[i].m(div0, null);
						}
					}

					for (; i < each0_blocks.length; i += 1) {
						each0_blocks[i].d(1);
					}
					each0_blocks.length = each0_value.length;
				}

				if (changed.shareUrl) {
					setData(text13, ctx.shareUrl);
					a.href = ctx.shareUrl;
				}

				if (changed.embed_templates || changed.embed_type) {
					each1_value = ctx.embed_templates;

					for (var i = 0; i < each1_value.length; i += 1) {
						const child_ctx = get_each1_context(ctx, each1_value, i);

						if (each1_blocks[i]) {
							each1_blocks[i].p(changed, child_ctx);
						} else {
							each1_blocks[i] = create_each_block_1(component, child_ctx);
							each1_blocks[i].c();
							each1_blocks[i].m(div6, null);
						}
					}

					for (; i < each1_blocks.length; i += 1) {
						each1_blocks[i].d(1);
					}
					each1_blocks.length = each1_value.length;
				}

				if (changed.embedCode) {
					input1.value = ctx.embedCode;
				}

				if ((changed.copy_success) && div8_class_value !== (div8_class_value = "copy-success " + (ctx.copy_success ? 'show':'') + " svelte-1ee9woc")) {
					div8.className = div8_class_value;
				}

				if (changed.embed_templates) {
					each2_value = ctx.embed_templates.slice(2);

					for (var i = 0; i < each2_value.length; i += 1) {
						const child_ctx = get_each2_context(ctx, each2_value, i);

						if (each2_blocks[i]) {
							each2_blocks[i].p(changed, child_ctx);
						} else {
							each2_blocks[i] = create_each_block(component, child_ctx);
							each2_blocks[i].c();
							each2_blocks[i].m(div11, null);
						}
					}

					for (; i < each2_blocks.length; i += 1) {
						each2_blocks[i].d(1);
					}
					each2_blocks.length = each2_value.length;
				}

				if ((changed.published) && div13_class_value !== (div13_class_value = ctx.published?'':'inactive')) {
					div13.className = div13_class_value;
				}
			},

			d: function destroy(detach) {
				if_block0.d(detach);
				if (detach) {
					detachNode(text0);
					detachNode(button0);
				}

				if_block1.d();
				removeListener(button0, "click", click_handler);
				if (detach) {
					detachNode(text1);
				}

				if (if_block2) if_block2.d(detach);
				if (detach) {
					detachNode(text2);
				}

				if (if_block3) if_block3.d(detach);
				if (detach) {
					detachNode(text3);
				}

				if (if_block4) if_block4.d(detach);
				if (detach) {
					detachNode(text4);
				}

				if (if_block5) if_block5.d(detach);
				if (detach) {
					detachNode(text5);
				}

				if (if_block6) if_block6.d(detach);
				if (detach) {
					detachNode(text6);
					detachNode(div13);
				}

				component._bindingGroups[0].splice(component._bindingGroups[0].indexOf(input0), 1);
				removeListener(input0, "change", input0_change_handler);

				destroyEach(each0_blocks, detach);

				help0.destroy();

				destroyEach(each1_blocks, detach);

				if (component.refs.embedInput === input1) component.refs.embedInput = null;
				removeListener(button1, "click", click_handler_1);

				destroyEach(each2_blocks, detach);

				help1.destroy();
			}
		};
	}

	// (3:0) {:else}
	function create_else_block_1(component, ctx) {
		var p, raw_value = __('publish / publish-intro');

		return {
			c: function create() {
				p = createElement("p");
				setStyle(p, "margin-bottom", "20px");
				addLoc(p, file$1, 3, 0, 72);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (1:0) {#if published}
	function create_if_block_6(component, ctx) {
		var p, raw_value = __('publish / republish-intro');

		return {
			c: function create() {
				p = createElement("p");
				addLoc(p, file$1, 1, 0, 16);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (12:4) {:else}
	function create_else_block$1(component, ctx) {
		var span1, i, i_class_value, text0, span0, text1_value = __('publish / publish-btn'), text1;

		return {
			c: function create() {
				span1 = createElement("span");
				i = createElement("i");
				text0 = createText("\n        ");
				span0 = createElement("span");
				text1 = createText(text1_value);
				i.className = i_class_value = "fa fa-fw " + (ctx.publishing ? 'fa-refresh fa-spin' : 'fa-cloud-upload') + " svelte-1ee9woc";
				addLoc(i, file$1, 13, 9, 534);
				span0.className = "title svelte-1ee9woc";
				addLoc(span0, file$1, 14, 8, 623);
				span1.className = "publish";
				addLoc(span1, file$1, 12, 4, 503);
			},

			m: function mount(target, anchor) {
				insert(target, span1, anchor);
				append(span1, i);
				append(span1, text0);
				append(span1, span0);
				append(span0, text1);
			},

			p: function update(changed, ctx) {
				if ((changed.publishing) && i_class_value !== (i_class_value = "fa fa-fw " + (ctx.publishing ? 'fa-refresh fa-spin' : 'fa-cloud-upload') + " svelte-1ee9woc")) {
					i.className = i_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span1);
				}
			}
		};
	}

	// (8:4) {#if published}
	function create_if_block_5(component, ctx) {
		var span1, i, i_class_value, text0, span0, text1_value = __('publish / republish-btn'), text1;

		return {
			c: function create() {
				span1 = createElement("span");
				i = createElement("i");
				text0 = createText(" ");
				span0 = createElement("span");
				text1 = createText(text1_value);
				i.className = i_class_value = "fa fa-fw fa-refresh " + (ctx.publishing ? 'fa-spin' : '') + " svelte-1ee9woc";
				addLoc(i, file$1, 9, 9, 348);
				span0.className = "title svelte-1ee9woc";
				addLoc(span0, file$1, 9, 75, 414);
				span1.className = "re-publish";
				addLoc(span1, file$1, 8, 4, 314);
			},

			m: function mount(target, anchor) {
				insert(target, span1, anchor);
				append(span1, i);
				append(span1, text0);
				append(span1, span0);
				append(span0, text1);
			},

			p: function update(changed, ctx) {
				if ((changed.publishing) && i_class_value !== (i_class_value = "fa fa-fw fa-refresh " + (ctx.publishing ? 'fa-spin' : '') + " svelte-1ee9woc")) {
					i.className = i_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(span1);
				}
			}
		};
	}

	// (20:0) {#if !published}
	function create_if_block_4(component, ctx) {
		var div2, div0, i, text, div1, raw_value = __('publish / publish-btn-intro');

		return {
			c: function create() {
				div2 = createElement("div");
				div0 = createElement("div");
				i = createElement("i");
				text = createText("\n    ");
				div1 = createElement("div");
				i.className = "fa fa-chevron-left";
				addLoc(i, file$1, 22, 8, 792);
				div0.className = "arrow svelte-1ee9woc";
				addLoc(div0, file$1, 21, 4, 764);
				div1.className = "text svelte-1ee9woc";
				addLoc(div1, file$1, 24, 4, 842);
				div2.className = "publish-intro svelte-1ee9woc";
				addLoc(div2, file$1, 20, 0, 732);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div0);
				append(div0, i);
				append(div2, text);
				append(div2, div1);
				div1.innerHTML = raw_value;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div2);
				}
			}
		};
	}

	// (29:6) {#if needs_republish && !publishing}
	function create_if_block_3(component, ctx) {
		var div, raw_value = __('publish / republish-alert');

		return {
			c: function create() {
				div = createElement("div");
				div.className = "btn-aside alert svelte-1ee9woc";
				addLoc(div, file$1, 29, 0, 973);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (33:6) {#if published && !needs_republish && progress === 1 && !publishing}
	function create_if_block_2(component, ctx) {
		var div, raw_value = __('publish / publish-success');

		return {
			c: function create() {
				div = createElement("div");
				div.className = "alert alert-success";
				addLoc(div, file$1, 33, 0, 1130);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = raw_value;
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (37:6) {#if publish_error}
	function create_if_block_1$1(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "alert alert-error";
				addLoc(div, file$1, 37, 0, 1242);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				div.innerHTML = ctx.publish_error;
			},

			p: function update(changed, ctx) {
				if (changed.publish_error) {
					div.innerHTML = ctx.publish_error;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (41:6) {#if publishing}
	function create_if_block$1(component, ctx) {
		var div2, text0_value = __("publish / progress / please-wait"), text0, text1, div1, div0, div0_class_value, div2_class_value;

		return {
			c: function create() {
				div2 = createElement("div");
				text0 = createText(text0_value);
				text1 = createText("\n    ");
				div1 = createElement("div");
				div0 = createElement("div");
				div0.className = div0_class_value = "bar " + (ctx.progress < 1 ? '' : 'bar-success') + " svelte-1ee9woc";
				addLoc(div0, file$1, 44, 8, 1516);
				div1.className = "progress progress-striped active svelte-1ee9woc";
				addLoc(div1, file$1, 43, 4, 1461);
				div2.className = div2_class_value = "alert " + (ctx.progress < 1 ? 'alert-info' : 'alert-success') + " publishing" + " svelte-1ee9woc";
				addLoc(div2, file$1, 41, 0, 1331);
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, text0);
				append(div2, text1);
				append(div2, div1);
				append(div1, div0);
				component.refs.bar = div0;
			},

			p: function update(changed, ctx) {
				if ((changed.progress) && div0_class_value !== (div0_class_value = "bar " + (ctx.progress < 1 ? '' : 'bar-success') + " svelte-1ee9woc")) {
					div0.className = div0_class_value;
				}

				if ((changed.progress) && div2_class_value !== (div2_class_value = "alert " + (ctx.progress < 1 ? 'alert-info' : 'alert-success') + " publishing" + " svelte-1ee9woc")) {
					div2.className = div2_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div2);
				}

				if (component.refs.bar === div0) component.refs.bar = null;
			}
		};
	}

	// (62:20) {#each plugin_shareurls as tpl}
	function create_each_block_2(component, ctx) {
		var label, input, input_value_value, text, raw_value = ctx.tpl.name, raw_before;

		function input_change_handler() {
			component.set({ shareurl_type: input.__value });
		}

		return {
			c: function create() {
				label = createElement("label");
				input = createElement("input");
				text = createText(" ");
				raw_before = createElement('noscript');
				component._bindingGroups[0].push(input);
				addListener(input, "change", input_change_handler);
				input.__value = input_value_value = ctx.tpl.id;
				input.value = input.__value;
				setAttribute(input, "type", "radio");
				input.name = "url-type";
				input.className = "svelte-1ee9woc";
				addLoc(input, file$1, 62, 42, 2290);
				label.className = "radio";
				addLoc(label, file$1, 62, 20, 2268);
			},

			m: function mount(target, anchor) {
				insert(target, label, anchor);
				append(label, input);

				input.checked = input.__value === ctx.shareurl_type;

				append(label, text);
				append(label, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: function update(changed, ctx) {
				if (changed.shareurl_type) input.checked = input.__value === ctx.shareurl_type;
				if ((changed.plugin_shareurls) && input_value_value !== (input_value_value = ctx.tpl.id)) {
					input.__value = input_value_value;
				}

				input.value = input.__value;
				if ((changed.plugin_shareurls) && raw_value !== (raw_value = ctx.tpl.name)) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", raw_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(label);
				}

				component._bindingGroups[0].splice(component._bindingGroups[0].indexOf(input), 1);
				removeListener(input, "change", input_change_handler);
			}
		};
	}

	// (82:20) {#each embed_templates as tpl}
	function create_each_block_1(component, ctx) {
		var label, input, input_value_value, text, raw_value = ctx.tpl.title, raw_before;

		function input_change_handler() {
			component.set({ embed_type: input.__value });
		}

		return {
			c: function create() {
				label = createElement("label");
				input = createElement("input");
				text = createText(" ");
				raw_before = createElement('noscript');
				component._bindingGroups[1].push(input);
				addListener(input, "change", input_change_handler);
				setAttribute(input, "type", "radio");
				input.__value = input_value_value = ctx.tpl.id;
				input.value = input.__value;
				input.className = "svelte-1ee9woc";
				addLoc(input, file$1, 82, 41, 3044);
				label.className = "radio";
				addLoc(label, file$1, 82, 20, 3023);
			},

			m: function mount(target, anchor) {
				insert(target, label, anchor);
				append(label, input);

				input.checked = input.__value === ctx.embed_type;

				append(label, text);
				append(label, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: function update(changed, ctx) {
				if (changed.embed_type) input.checked = input.__value === ctx.embed_type;
				if ((changed.embed_templates) && input_value_value !== (input_value_value = ctx.tpl.id)) {
					input.__value = input_value_value;
				}

				input.value = input.__value;
				if ((changed.embed_templates) && raw_value !== (raw_value = ctx.tpl.title)) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", raw_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(label);
				}

				component._bindingGroups[1].splice(component._bindingGroups[1].indexOf(input), 1);
				removeListener(input, "change", input_change_handler);
			}
		};
	}

	// (97:54) {#each embed_templates.slice(2) as tpl}
	function create_each_block(component, ctx) {
		var div, b, text0_value = ctx.tpl.title, text0, text1, text2, raw_value = ctx.tpl.text, raw_before;

		return {
			c: function create() {
				div = createElement("div");
				b = createElement("b");
				text0 = createText(text0_value);
				text1 = createText(":");
				text2 = createText(" ");
				raw_before = createElement('noscript');
				addLoc(b, file$1, 97, 21, 3817);
				addLoc(div, file$1, 97, 16, 3812);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, b);
				append(b, text0);
				append(b, text1);
				append(div, text2);
				append(div, raw_before);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			},

			p: function update(changed, ctx) {
				if ((changed.embed_templates) && text0_value !== (text0_value = ctx.tpl.title)) {
					setData(text0, text0_value);
				}

				if ((changed.embed_templates) && raw_value !== (raw_value = ctx.tpl.text)) {
					detachAfter(raw_before);
					raw_before.insertAdjacentHTML("afterend", raw_value);
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
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
		this._intro = true;

		this._handlers.state = [onstate];

		onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$1(this, this._state);

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

	function assign$1(tar, src) {
		for (var k in src) tar[k] = src[k];
		return tar;
	}

	function blankObject$1() {
		return Object.create(null);
	}

	function _differs$1(a, b) {
		return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
	}

	function _differsImmutable(a, b) {
		return a != a ? b == b : a !== b;
	}

	function fire$1(eventName, data) {
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

	function get$1(key) {
		return key ? this._state[key] : this._state;
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

	function on$1(eventName, handler) {
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

	function Store(state, options) {
		this._observers = { pre: blankObject$1(), post: blankObject$1() };
		this._handlers = {};
		this._dependents = [];

		this._computed = blankObject$1();
		this._sortedComputedProperties = [];

		this._state = assign$1({}, state);
		this._differs = options && options.immutable ? _differsImmutable : _differs$1;
	}

	assign$1(Store.prototype, {
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
			var visited = blankObject$1();

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
				cycles = blankObject$1();
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

		fire: fire$1,

		get: get$1,

		// TODO remove this method
		observe: observe,

		on: on$1,

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

			this._state = assign$1(assign$1({}, oldState), newState);

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

	/* eslint camelcase: "off" */
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

	var main = { App, data: data$2, store };

	return main;

}));
//# sourceMappingURL=publish_old.js.map
