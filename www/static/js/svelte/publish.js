(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.publish = factory());
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

	function removeFromStore() {
		this.store._remove(this);
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

	/* home/david/Projects/core/services/datawrapper/src/publish/Action.html generated by Svelte v2.16.1 */

	function data$1() {
	    return { loading: false };
	}
	const file$1 = "home/david/Projects/core/services/datawrapper/src/publish/Action.html";

	function create_main_fragment$1(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.loading) && create_if_block$1(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.loading) {
					if (!if_block) {
						if_block = create_if_block$1(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	// (2:0) {#if loading}
	function create_if_block$1(component, ctx) {
		var p, i, text;

		return {
			c: function create() {
				p = createElement("p");
				i = createElement("i");
				text = createText(" loading...");
				i.className = "fa fa-spinner fa-pulse fa-fw";
				addLoc(i, file$1, 2, 21, 60);
				p.className = "mini-help";
				addLoc(p, file$1, 2, 0, 39);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				append(p, i);
				append(p, text);
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	function Action(options) {
		this._debugName = '<Action>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$1(), options.data);
		if (!('loading' in this._state)) console.warn("<Action> was created without expected data property 'loading'");
		this._intro = true;

		this._fragment = create_main_fragment$1(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(Action.prototype, protoDev);

	Action.prototype._checkReadOnly = function _checkReadOnly(newState) {
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

	/**
	 * injects a <script> element to the page to load a new JS script
	 *
	 * @param {string} src
	 * @param {function} callback
	 */
	function loadScript(src, callback) {
	    const script = document.createElement('script');
	    script.src = src;
	    script.onload = () => {
	        if (callback) callback();
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
	    const link = document.createElement('link');
	    link.rel = 'stylesheet';
	    link.href = src;
	    link.onload = () => {
	        if (callback) callback();
	    };
	    document.head.appendChild(link);
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

	/* home/david/Projects/core/services/datawrapper/src/publish/Publish.html generated by Svelte v2.16.1 */



	let fakeProgress = 0;
	let initial_auto_publish = true;

	function shareUrl({ shareurl_type, $id, $publicUrl, plugin_shareurls, published }) {
	    if (!published) return 'https://www.datawrapper.de/...';
	    if (shareurl_type === 'default') return $publicUrl;
	    let url = '';
	    plugin_shareurls.forEach(t => {
	        if (t.id === shareurl_type) url = t.url.replace(/%chart_id%/g, $id);
	    });
	    return url;
	}
	function sortedChartActions({ chartActions, $actions }) {
	    return chartActions
	        .concat($actions)
	        .filter(a => a.id !== 'publish-s3')
	        .sort((a, b) => a.order - b.order);
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
	        Action,
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
	    publish() {
	        this.set({
	            publishing: true,
	            progress: 0,
	            publish_error: false
	        });

	        const chart = this.store;
	        // generate embed codes
	        chart.setMetadata('publish.embed-heights', computeEmbedHeights(chart, this.get().embed_templates));

	        // save embed heights and wait until it's done before
	        // we start to publish the chart
	        trackEvent('Chart Editor', 'publish');

	        chart.store(() => {
	            // publish chart
	            postJSON(`/api/charts/${chart.get().id}/publish`, null, res => {
	                if (res.status === 'ok') {
	                    this.publishFinished(res.data);
	                    trackEvent('Chart Editor', 'publish-success');
	                } else {
	                    trackEvent('Chart Editor', 'publish-error', res.message);
	                    this.set({
	                        publish_error: res.message
	                    });
	                }
	            });
	            fakeProgress = 0;
	            this.updateStatus();
	        });
	    },

	    updateProgressBar(p) {
	        if (this.refs.bar) {
	            this.refs.bar.style.width = (p * 100).toFixed() + '%';
	        }
	    },

	    updateStatus() {
	        const chart = this.store;
	        fakeProgress += 0.05;
	        getJSON(`/api/charts/${chart.get().id}/publish/status`, res => {
	            if (res) {
	                res = +res / 100 + fakeProgress;
	                this.set({ progress: Math.min(1, res) });
	            }
	            if (this.get().publishing) {
	                setTimeout(() => {
	                    this.updateStatus();
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
	        this.store.set({
	            lastEditStep: 5
	        });
	        setTimeout(() => this.set({ publishing: false }), 500);
	        this.store.set(chartInfo);
	    },

	    setEmbedCode() {
	        const chart = this.store;
	        const state = this.get();
	        if (!state) return;
	        const embedType = state.embed_type ? `embed-method-${state.embed_type}` : null;

	        const { publicUrl } = chart.get();
	        const embedCodes = chart.getMetadata('publish.embed-codes');
	        const embedHeight = chart.getMetadata('publish.embed-height');

	        this.set({
	            embedCode:
	                embedCodes && embedCodes[embedType]
	                    ? embedCodes[embedType]
	                    : `<iframe src="${publicUrl}" width="100%" height="${embedHeight}" scrolling="no" frameborder="0" allowtransparency="true"></iframe>`
	        });
	    },

	    copy() {
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
	    },

	    select(action, event) {
	        event.preventDefault();
	        // set hash which is used to show the action module
	        window.location.hash = action.id;

	        const { active_action } = this.get();
	        if (action.id === active_action) {
	            // unselect current action
	            return this.set({ active_action: '', Action });
	        }
	        this.set({ active_action: action.id });
	        if (action.mod) {
	            if (action.mod.App) {
	                this.set({ Action: action.mod.App });
	            } else {
	                // todo: show loading indicator
	                this.set({ Action });
	                this.refs.action.set({ loading: true });
	                if (action.mod.css) {
	                    loadStylesheet(action.mod.css);
	                }
	                loadScript(action.mod.src, () => {
	                    setTimeout(() => {
	                        require([action.mod.id], mod => {
	                            // todo: HIDE loading indicator
	                            Object.assign(action.mod, mod);
	                            this.set({ Action: action.mod.App });
	                            if (mod.init) mod.init(this.refs.action);
	                            if (action.mod.data) this.refs.action.set(action.mod.data);
	                        });
	                    }, 200);
	                });
	            }
	        } else if (action.action && this[action.action]) {
	            this.set({ Action });
	            this[action.action]();
	        } else if (typeof action.action === 'function') {
	            this.set({ Action });
	            action.action();
	        }
	    },

	    duplicate() {
	        const { id } = this.store.get();
	        trackEvent('Chart Editor', 'duplicate');
	        postJSON(`/api/charts/${id}/copy`, null, res => {
	            if (res.status === 'ok') {
	                // redirect to copied chart
	                window.location.href = `/edit/${res.data.id}/visualize`;
	            } else {
	                console.warn(res);
	            }
	        });
	    }
	};

	function oncreate() {
	    const { lastEditStep } = this.store.get();
	    this.set({ published: lastEditStep > 4 });
	    // store reference to publish step
	    window.dw.backend.fire('edit.publish.oncreate', this);
	    // watch changes
	    this.setEmbedCode();
	    const chart = this.store;
	    chart.observeDeep('metadata.publish.embed-codes', () => this.setEmbedCode());
	    chart.observeDeep('metadata.publish.embed-height', () => this.setEmbedCode());
	    chart.observeDeep('publicUrl', () => this.setEmbedCode());
	}
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
	    if (changed.embed_type) {
	        this.setEmbedCode();
	    }
	    if (changed.shareurl_type && userDataReady) {
	        const data = window.dw.backend.__userData;
	        if (!current.shareurl_type || !data) return;
	        data.shareurl_type = current.shareurl_type;
	        window.dw.backend.setUserData(data);
	    }
	    if (changed.published) {
	        const publishStep = window.document.querySelector('.dw-create-publish .publish-step');
	        if (publishStep) {
	            publishStep.classList[current.published ? 'add' : 'remove']('is-published');
	        }
	    }
	    if (changed.auto_publish) {
	        if (current.auto_publish && initial_auto_publish) {
	            this.publish();
	            initial_auto_publish = false;
	            window.history.replaceState('', '', window.location.pathname);
	        }
	    }
	}
	const file$2 = "home/david/Projects/core/services/datawrapper/src/publish/Publish.html";

	function click_handler(event) {
		const { component, ctx } = this._svelte;

		component.select(ctx.action, event);
	}

	function get_each3_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.action = list[i];
		return child_ctx;
	}

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

	function create_main_fragment$2(component, ctx) {
		var div16, text0, text1, button0, button0_class_value, text2, text3, text4, text5, text6, text7, div13, h20, raw0_value = __('publish / share-embed'), text8, div5, i0, text9, div3, div1, b0, raw1_value = __('publish / share-url'), text10, div0, label, input0, text11, raw2_value = __('publish / share-url / fullscreen'), raw2_before, text12, text13, div2, a, text14, text15, div4, raw3_value = __('publish / help / share-url'), text16, div12, i1, text17, div10, div7, b1, raw4_value = __('publish / embed'), text18, div6, text19, div9, input1, text20, button1, i2, text21, text22_value = __('publish / copy'), text22, text23, div8, text24_value = __('publish / copy-success'), text24, div8_class_value, text25, div11, raw5_value = __('publish / embed / help'), raw5_after, text26, div13_class_value, text27, text28, div15, div14, h21, text29, text30, ul, text31;

		var if_block0 = (ctx.publishHed) && create_if_block_11(component, ctx);

		function select_block_type(ctx) {
			if (ctx.publishIntro) return create_if_block_9;
			if (ctx.published) return create_if_block_10;
			return create_else_block_1;
		}

		var current_block_type = select_block_type(ctx);
		var if_block1 = current_block_type(component, ctx);

		function select_block_type_1(ctx) {
			if (ctx.published) return create_if_block_8;
			return create_else_block$1;
		}

		var current_block_type_1 = select_block_type_1(ctx);
		var if_block2 = current_block_type_1(component, ctx);

		function click_handler(event) {
			component.publish();
		}

		var if_block3 = (!ctx.published) && create_if_block_7(component, ctx);

		var if_block4 = (ctx.needs_republish && !ctx.publishing) && create_if_block_6(component, ctx);

		var if_block5 = (ctx.published && !ctx.needs_republish && ctx.progress === 1 && !ctx.publishing) && create_if_block_5(component, ctx);

		var if_block6 = (ctx.publish_error) && create_if_block_4(component, ctx);

		var if_block7 = (ctx.publishing) && create_if_block_3(component, ctx);

		function input0_change_handler() {
			component.set({ shareurl_type: input0.__value });
		}

		var each0_value = ctx.plugin_shareurls;

		var each0_blocks = [];

		for (var i = 0; i < each0_value.length; i += 1) {
			each0_blocks[i] = create_each_block_3(component, get_each0_context(ctx, each0_value, i));
		}

		var help0 = new Help({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() }
		});

		var each1_value = ctx.embed_templates;

		var each1_blocks = [];

		for (var i = 0; i < each1_value.length; i += 1) {
			each1_blocks[i] = create_each_block_2(component, get_each1_context(ctx, each1_value, i));
		}

		function click_handler_1(event) {
			component.copy(ctx.embedCode);
		}

		var each2_value = ctx.embed_templates.slice(2);

		var each2_blocks = [];

		for (var i = 0; i < each2_value.length; i += 1) {
			each2_blocks[i] = create_each_block_1(component, get_each2_context(ctx, each2_value, i));
		}

		var help1 = new Help({
			root: component.root,
			store: component.store,
			slots: { default: createFragment() }
		});

		var switch_value = ctx.beforeExport;

		function switch_props(ctx) {
			return {
				root: component.root,
				store: component.store
			};
		}

		if (switch_value) {
			var switch_instance0 = new switch_value(switch_props(ctx));
		}

		var if_block8 = (ctx.exportIntro) && create_if_block_2(component, ctx);

		var each3_value = ctx.sortedChartActions;

		var each3_blocks = [];

		for (var i = 0; i < each3_value.length; i += 1) {
			each3_blocks[i] = create_each_block(component, get_each3_context(ctx, each3_value, i));
		}

		var switch_value_1 = ctx.Action;

		function switch_props_1(ctx) {
			var switch_instance1_initial_data = {
			 	visible: true,
			 	show: true
			 };
			return {
				root: component.root,
				store: component.store,
				data: switch_instance1_initial_data
			};
		}

		if (switch_value_1) {
			var switch_instance1 = new switch_value_1(switch_props_1(ctx));
		}

		return {
			c: function create() {
				div16 = createElement("div");
				if (if_block0) if_block0.c();
				text0 = createText(" ");
				if_block1.c();
				text1 = createText("\n\n    ");
				button0 = createElement("button");
				if_block2.c();
				text2 = createText("\n\n    ");
				if (if_block3) if_block3.c();
				text3 = createText(" ");
				if (if_block4) if_block4.c();
				text4 = createText(" ");
				if (if_block5) if_block5.c();
				text5 = createText(" ");
				if (if_block6) if_block6.c();
				text6 = createText(" ");
				if (if_block7) if_block7.c();
				text7 = createText("\n\n    ");
				div13 = createElement("div");
				h20 = createElement("h2");
				text8 = createText("\n        ");
				div5 = createElement("div");
				i0 = createElement("i");
				text9 = createText("\n            ");
				div3 = createElement("div");
				div1 = createElement("div");
				b0 = createElement("b");
				text10 = createText("\n                    ");
				div0 = createElement("div");
				label = createElement("label");
				input0 = createElement("input");
				text11 = createText("\n                            ");
				raw2_before = createElement('noscript');
				text12 = createText("\n                        ");

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].c();
				}

				text13 = createText("\n                ");
				div2 = createElement("div");
				a = createElement("a");
				text14 = createText(ctx.shareUrl);
				text15 = createText("\n            ");
				div4 = createElement("div");
				help0._fragment.c();
				text16 = createText("\n\n        ");
				div12 = createElement("div");
				i1 = createElement("i");
				text17 = createText("\n            ");
				div10 = createElement("div");
				div7 = createElement("div");
				b1 = createElement("b");
				text18 = createText("\n                    ");
				div6 = createElement("div");

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].c();
				}

				text19 = createText("\n                ");
				div9 = createElement("div");
				input1 = createElement("input");
				text20 = createText("\n                    ");
				button1 = createElement("button");
				i2 = createElement("i");
				text21 = createText(" ");
				text22 = createText(text22_value);
				text23 = createText("\n                    ");
				div8 = createElement("div");
				text24 = createText(text24_value);
				text25 = createText("\n            ");
				div11 = createElement("div");
				raw5_after = createElement('noscript');
				text26 = createText(" ");

				for (var i = 0; i < each2_blocks.length; i += 1) {
					each2_blocks[i].c();
				}

				help1._fragment.c();
				text27 = createText("\n\n    \n    ");
				if (switch_instance0) switch_instance0._fragment.c();
				text28 = createText("\n\n    \n    ");
				div15 = createElement("div");
				div14 = createElement("div");
				h21 = createElement("h2");
				text29 = createText("\n            ");
				if (if_block8) if_block8.c();
				text30 = createText("\n\n        ");
				ul = createElement("ul");

				for (var i = 0; i < each3_blocks.length; i += 1) {
					each3_blocks[i].c();
				}

				text31 = createText("\n\n        ");
				if (switch_instance1) switch_instance1._fragment.c();
				addListener(button0, "click", click_handler);
				button0.disabled = ctx.publishing;
				button0.className = button0_class_value = "btn-publish btn btn-primary btn-large " + (ctx.published?'':'btn-first-publish') + " svelte-1njbtly";
				addLoc(button0, file$2, 12, 4, 353);
				addLoc(h20, file$2, 56, 8, 2041);
				i0.className = "icon fa fa-link fa-fw";
				addLoc(i0, file$2, 58, 12, 2127);
				addLoc(b0, file$2, 61, 20, 2249);
				component._bindingGroups[0].push(input0);
				addListener(input0, "change", input0_change_handler);
				input0.__value = "default";
				input0.value = input0.__value;
				setAttribute(input0, "type", "radio");
				input0.name = "url-type";
				input0.className = "svelte-1njbtly";
				addLoc(input0, file$2, 64, 28, 2413);
				label.className = "radio";
				addLoc(label, file$2, 63, 24, 2363);
				div0.className = "embed-options svelte-1njbtly";
				addLoc(div0, file$2, 62, 20, 2311);
				div1.className = "h";
				addLoc(div1, file$2, 60, 16, 2213);
				a.target = "_blank";
				a.className = "share-url svelte-1njbtly";
				a.href = ctx.shareUrl;
				addLoc(a, file$2, 75, 20, 3004);
				div2.className = "inpt";
				addLoc(div2, file$2, 74, 16, 2965);
				div3.className = "ctrls";
				addLoc(div3, file$2, 59, 12, 2177);
				addLoc(div4, file$2, 79, 16, 3151);
				div5.className = "block";
				addLoc(div5, file$2, 57, 8, 2095);
				i1.className = "icon fa fa-code fa-fw";
				addLoc(i1, file$2, 84, 12, 3280);
				addLoc(b1, file$2, 87, 20, 3402);
				div6.className = "embed-options svelte-1njbtly";
				addLoc(div6, file$2, 88, 20, 3460);
				div7.className = "h";
				addLoc(div7, file$2, 86, 16, 3366);
				setAttribute(input1, "type", "text");
				input1.className = "input embed-code";
				input1.readOnly = true;
				input1.value = ctx.embedCode;
				addLoc(input1, file$2, 95, 20, 3816);
				i2.className = "fa fa-copy";
				addLoc(i2, file$2, 96, 89, 3996);
				addListener(button1, "click", click_handler_1);
				button1.className = "btn btn-copy";
				button1.title = "copy";
				addLoc(button1, file$2, 96, 20, 3927);
				div8.className = div8_class_value = "copy-success " + (ctx.copy_success ? 'show':'') + " svelte-1njbtly";
				addLoc(div8, file$2, 97, 20, 4077);
				div9.className = "inpt";
				addLoc(div9, file$2, 94, 16, 3777);
				div10.className = "ctrls";
				addLoc(div10, file$2, 85, 12, 3330);
				addLoc(div11, file$2, 103, 16, 4292);
				div12.className = "block";
				addLoc(div12, file$2, 83, 8, 3248);
				setStyle(div13, "margin-top", "30px");
				div13.className = div13_class_value = ctx.published?'':'inactive';
				addLoc(div13, file$2, 55, 4, 1969);
				h21.className = "pad-top";
				addLoc(h21, file$2, 118, 12, 4722);
				addLoc(div14, file$2, 117, 8, 4704);
				ul.className = "chart-actions";
				addLoc(ul, file$2, 124, 8, 4876);
				div15.className = "export-and-duplicate";
				addLoc(div15, file$2, 116, 4, 4661);
				addLoc(div16, file$2, 1, 0, 26);
			},

			m: function mount(target, anchor) {
				insert(target, div16, anchor);
				if (if_block0) if_block0.m(div16, null);
				append(div16, text0);
				if_block1.m(div16, null);
				append(div16, text1);
				append(div16, button0);
				if_block2.m(button0, null);
				append(div16, text2);
				if (if_block3) if_block3.m(div16, null);
				append(div16, text3);
				if (if_block4) if_block4.m(div16, null);
				append(div16, text4);
				if (if_block5) if_block5.m(div16, null);
				append(div16, text5);
				if (if_block6) if_block6.m(div16, null);
				append(div16, text6);
				if (if_block7) if_block7.m(div16, null);
				append(div16, text7);
				append(div16, div13);
				append(div13, h20);
				h20.innerHTML = raw0_value;
				append(div13, text8);
				append(div13, div5);
				append(div5, i0);
				append(div5, text9);
				append(div5, div3);
				append(div3, div1);
				append(div1, b0);
				b0.innerHTML = raw1_value;
				append(div1, text10);
				append(div1, div0);
				append(div0, label);
				append(label, input0);

				input0.checked = input0.__value === ctx.shareurl_type;

				append(label, text11);
				append(label, raw2_before);
				raw2_before.insertAdjacentHTML("afterend", raw2_value);
				append(div0, text12);

				for (var i = 0; i < each0_blocks.length; i += 1) {
					each0_blocks[i].m(div0, null);
				}

				append(div3, text13);
				append(div3, div2);
				append(div2, a);
				append(a, text14);
				append(div5, text15);
				append(help0._slotted.default, div4);
				div4.innerHTML = raw3_value;
				help0._mount(div5, null);
				append(div13, text16);
				append(div13, div12);
				append(div12, i1);
				append(div12, text17);
				append(div12, div10);
				append(div10, div7);
				append(div7, b1);
				b1.innerHTML = raw4_value;
				append(div7, text18);
				append(div7, div6);

				for (var i = 0; i < each1_blocks.length; i += 1) {
					each1_blocks[i].m(div6, null);
				}

				append(div10, text19);
				append(div10, div9);
				append(div9, input1);
				component.refs.embedInput = input1;
				append(div9, text20);
				append(div9, button1);
				append(button1, i2);
				append(button1, text21);
				append(button1, text22);
				append(div9, text23);
				append(div9, div8);
				append(div8, text24);
				append(div12, text25);
				append(help1._slotted.default, div11);
				append(div11, raw5_after);
				raw5_after.insertAdjacentHTML("beforebegin", raw5_value);
				append(div11, text26);

				for (var i = 0; i < each2_blocks.length; i += 1) {
					each2_blocks[i].m(div11, null);
				}

				help1._mount(div12, null);
				append(div16, text27);

				if (switch_instance0) {
					switch_instance0._mount(div16, null);
				}

				append(div16, text28);
				append(div16, div15);
				append(div15, div14);
				append(div14, h21);
				h21.innerHTML = ctx.exportHed;
				append(div14, text29);
				if (if_block8) if_block8.m(div14, null);
				append(div15, text30);
				append(div15, ul);

				for (var i = 0; i < each3_blocks.length; i += 1) {
					each3_blocks[i].m(ul, null);
				}

				append(div15, text31);

				if (switch_instance1) {
					switch_instance1._mount(div15, null);
					component.refs.action = switch_instance1;
				}
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (ctx.publishHed) {
					if (if_block0) {
						if_block0.p(changed, ctx);
					} else {
						if_block0 = create_if_block_11(component, ctx);
						if_block0.c();
						if_block0.m(div16, text0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type(component, ctx);
					if_block1.c();
					if_block1.m(div16, text1);
				}

				if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block2) {
					if_block2.p(changed, ctx);
				} else {
					if_block2.d(1);
					if_block2 = current_block_type_1(component, ctx);
					if_block2.c();
					if_block2.m(button0, null);
				}

				if (changed.publishing) {
					button0.disabled = ctx.publishing;
				}

				if ((changed.published) && button0_class_value !== (button0_class_value = "btn-publish btn btn-primary btn-large " + (ctx.published?'':'btn-first-publish') + " svelte-1njbtly")) {
					button0.className = button0_class_value;
				}

				if (!ctx.published) {
					if (!if_block3) {
						if_block3 = create_if_block_7(component, ctx);
						if_block3.c();
						if_block3.m(div16, text3);
					}
				} else if (if_block3) {
					if_block3.d(1);
					if_block3 = null;
				}

				if (ctx.needs_republish && !ctx.publishing) {
					if (!if_block4) {
						if_block4 = create_if_block_6(component, ctx);
						if_block4.c();
						if_block4.m(div16, text4);
					}
				} else if (if_block4) {
					if_block4.d(1);
					if_block4 = null;
				}

				if (ctx.published && !ctx.needs_republish && ctx.progress === 1 && !ctx.publishing) {
					if (!if_block5) {
						if_block5 = create_if_block_5(component, ctx);
						if_block5.c();
						if_block5.m(div16, text5);
					}
				} else if (if_block5) {
					if_block5.d(1);
					if_block5 = null;
				}

				if (ctx.publish_error) {
					if (if_block6) {
						if_block6.p(changed, ctx);
					} else {
						if_block6 = create_if_block_4(component, ctx);
						if_block6.c();
						if_block6.m(div16, text6);
					}
				} else if (if_block6) {
					if_block6.d(1);
					if_block6 = null;
				}

				if (ctx.publishing) {
					if (if_block7) {
						if_block7.p(changed, ctx);
					} else {
						if_block7 = create_if_block_3(component, ctx);
						if_block7.c();
						if_block7.m(div16, text7);
					}
				} else if (if_block7) {
					if_block7.d(1);
					if_block7 = null;
				}

				if (changed.shareurl_type) input0.checked = input0.__value === ctx.shareurl_type;

				if (changed.plugin_shareurls || changed.shareurl_type) {
					each0_value = ctx.plugin_shareurls;

					for (var i = 0; i < each0_value.length; i += 1) {
						const child_ctx = get_each0_context(ctx, each0_value, i);

						if (each0_blocks[i]) {
							each0_blocks[i].p(changed, child_ctx);
						} else {
							each0_blocks[i] = create_each_block_3(component, child_ctx);
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
					setData(text14, ctx.shareUrl);
					a.href = ctx.shareUrl;
				}

				if (changed.embed_templates || changed.embed_type) {
					each1_value = ctx.embed_templates;

					for (var i = 0; i < each1_value.length; i += 1) {
						const child_ctx = get_each1_context(ctx, each1_value, i);

						if (each1_blocks[i]) {
							each1_blocks[i].p(changed, child_ctx);
						} else {
							each1_blocks[i] = create_each_block_2(component, child_ctx);
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

				if ((changed.copy_success) && div8_class_value !== (div8_class_value = "copy-success " + (ctx.copy_success ? 'show':'') + " svelte-1njbtly")) {
					div8.className = div8_class_value;
				}

				if (changed.embed_templates) {
					each2_value = ctx.embed_templates.slice(2);

					for (var i = 0; i < each2_value.length; i += 1) {
						const child_ctx = get_each2_context(ctx, each2_value, i);

						if (each2_blocks[i]) {
							each2_blocks[i].p(changed, child_ctx);
						} else {
							each2_blocks[i] = create_each_block_1(component, child_ctx);
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

				if (switch_value !== (switch_value = ctx.beforeExport)) {
					if (switch_instance0) {
						switch_instance0.destroy();
					}

					if (switch_value) {
						switch_instance0 = new switch_value(switch_props(ctx));
						switch_instance0._fragment.c();
						switch_instance0._mount(div16, text28);
					} else {
						switch_instance0 = null;
					}
				}

				if (changed.exportHed) {
					h21.innerHTML = ctx.exportHed;
				}

				if (ctx.exportIntro) {
					if (if_block8) {
						if_block8.p(changed, ctx);
					} else {
						if_block8 = create_if_block_2(component, ctx);
						if_block8.c();
						if_block8.m(div14, null);
					}
				} else if (if_block8) {
					if_block8.d(1);
					if_block8 = null;
				}

				if (changed.sortedChartActions || changed.active_action) {
					each3_value = ctx.sortedChartActions;

					for (var i = 0; i < each3_value.length; i += 1) {
						const child_ctx = get_each3_context(ctx, each3_value, i);

						if (each3_blocks[i]) {
							each3_blocks[i].p(changed, child_ctx);
						} else {
							each3_blocks[i] = create_each_block(component, child_ctx);
							each3_blocks[i].c();
							each3_blocks[i].m(ul, null);
						}
					}

					for (; i < each3_blocks.length; i += 1) {
						each3_blocks[i].d(1);
					}
					each3_blocks.length = each3_value.length;
				}

				if (switch_value_1 !== (switch_value_1 = ctx.Action)) {
					if (switch_instance1) {
						switch_instance1.destroy();
					}

					if (switch_value_1) {
						switch_instance1 = new switch_value_1(switch_props_1(ctx));
						switch_instance1._fragment.c();
						switch_instance1._mount(div15, null);

						component.refs.action = switch_instance1;
					} else {
						switch_instance1 = null;
						if (component.refs.action === switch_instance1) {
							component.refs.action = null;
						}
					}
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div16);
				}

				if (if_block0) if_block0.d();
				if_block1.d();
				if_block2.d();
				removeListener(button0, "click", click_handler);
				if (if_block3) if_block3.d();
				if (if_block4) if_block4.d();
				if (if_block5) if_block5.d();
				if (if_block6) if_block6.d();
				if (if_block7) if_block7.d();
				component._bindingGroups[0].splice(component._bindingGroups[0].indexOf(input0), 1);
				removeListener(input0, "change", input0_change_handler);

				destroyEach(each0_blocks, detach);

				help0.destroy();

				destroyEach(each1_blocks, detach);

				if (component.refs.embedInput === input1) component.refs.embedInput = null;
				removeListener(button1, "click", click_handler_1);

				destroyEach(each2_blocks, detach);

				help1.destroy();
				if (switch_instance0) switch_instance0.destroy();
				if (if_block8) if_block8.d();

				destroyEach(each3_blocks, detach);

				if (switch_instance1) switch_instance1.destroy();
			}
		};
	}

	// (3:4) {#if publishHed}
	function create_if_block_11(component, ctx) {
		var h2;

		return {
			c: function create() {
				h2 = createElement("h2");
				h2.className = "pad-top";
				addLoc(h2, file$2, 3, 4, 57);
			},

			m: function mount(target, anchor) {
				insert(target, h2, anchor);
				h2.innerHTML = ctx.publishHed;
			},

			p: function update(changed, ctx) {
				if (changed.publishHed) {
					h2.innerHTML = ctx.publishHed;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(h2);
				}
			}
		};
	}

	// (9:4) {:else}
	function create_else_block_1(component, ctx) {
		var p, raw_value = __('publish / publish-intro');

		return {
			c: function create() {
				p = createElement("p");
				setStyle(p, "margin-bottom", "20px");
				addLoc(p, file$2, 9, 4, 258);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (7:12) {#if published}
	function create_if_block_10(component, ctx) {
		var p, raw_value = __('publish / republish-intro');

		return {
			c: function create() {
				p = createElement("p");
				addLoc(p, file$2, 7, 4, 194);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = raw_value;
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (5:10) {#if publishIntro}
	function create_if_block_9(component, ctx) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				addLoc(p, file$2, 5, 4, 134);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = ctx.publishIntro;
			},

			p: function update(changed, ctx) {
				if (changed.publishIntro) {
					p.innerHTML = ctx.publishIntro;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (18:8) {:else}
	function create_else_block$1(component, ctx) {
		var span1, i, i_class_value, text0, span0, text1_value = __('publish / publish-btn'), text1;

		return {
			c: function create() {
				span1 = createElement("span");
				i = createElement("i");
				text0 = createText("\n            ");
				span0 = createElement("span");
				text1 = createText(text1_value);
				i.className = i_class_value = "fa fa-fw " + (ctx.publishing ? 'fa-refresh fa-spin' : 'fa-cloud-upload') + " svelte-1njbtly";
				addLoc(i, file$2, 19, 13, 762);
				span0.className = "title svelte-1njbtly";
				addLoc(span0, file$2, 20, 12, 855);
				span1.className = "publish";
				addLoc(span1, file$2, 18, 8, 727);
			},

			m: function mount(target, anchor) {
				insert(target, span1, anchor);
				append(span1, i);
				append(span1, text0);
				append(span1, span0);
				append(span0, text1);
			},

			p: function update(changed, ctx) {
				if ((changed.publishing) && i_class_value !== (i_class_value = "fa fa-fw " + (ctx.publishing ? 'fa-refresh fa-spin' : 'fa-cloud-upload') + " svelte-1njbtly")) {
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

	// (14:8) {#if published}
	function create_if_block_8(component, ctx) {
		var span1, i, i_class_value, text0, span0, text1_value = __('publish / republish-btn'), text1;

		return {
			c: function create() {
				span1 = createElement("span");
				i = createElement("i");
				text0 = createText(" ");
				span0 = createElement("span");
				text1 = createText(text1_value);
				i.className = i_class_value = "fa fa-fw fa-refresh " + (ctx.publishing ? 'fa-spin' : '') + " svelte-1njbtly";
				addLoc(i, file$2, 15, 13, 560);
				span0.className = "title svelte-1njbtly";
				addLoc(span0, file$2, 15, 79, 626);
				span1.className = "re-publish";
				addLoc(span1, file$2, 14, 8, 522);
			},

			m: function mount(target, anchor) {
				insert(target, span1, anchor);
				append(span1, i);
				append(span1, text0);
				append(span1, span0);
				append(span0, text1);
			},

			p: function update(changed, ctx) {
				if ((changed.publishing) && i_class_value !== (i_class_value = "fa fa-fw fa-refresh " + (ctx.publishing ? 'fa-spin' : '') + " svelte-1njbtly")) {
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

	// (26:4) {#if !published}
	function create_if_block_7(component, ctx) {
		var div2, div0, i, text, div1, raw_value = __('publish / publish-btn-intro');

		return {
			c: function create() {
				div2 = createElement("div");
				div0 = createElement("div");
				i = createElement("i");
				text = createText("\n        ");
				div1 = createElement("div");
				i.className = "fa fa-chevron-left";
				addLoc(i, file$2, 28, 12, 1052);
				div0.className = "arrow svelte-1njbtly";
				addLoc(div0, file$2, 27, 8, 1020);
				div1.className = "text svelte-1njbtly";
				addLoc(div1, file$2, 30, 8, 1110);
				div2.className = "publish-intro svelte-1njbtly";
				addLoc(div2, file$2, 26, 4, 984);
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

	// (35:10) {#if needs_republish && !publishing}
	function create_if_block_6(component, ctx) {
		var div, raw_value = __('publish / republish-alert');

		return {
			c: function create() {
				div = createElement("div");
				div.className = "btn-aside alert svelte-1njbtly";
				addLoc(div, file$2, 35, 4, 1261);
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

	// (39:10) {#if published && !needs_republish && progress === 1 && !publishing}
	function create_if_block_5(component, ctx) {
		var div, raw_value = __('publish / publish-success');

		return {
			c: function create() {
				div = createElement("div");
				div.className = "alert alert-success svelte-1njbtly";
				addLoc(div, file$2, 39, 4, 1434);
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

	// (43:10) {#if publish_error}
	function create_if_block_4(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.className = "alert alert-error svelte-1njbtly";
				addLoc(div, file$2, 43, 4, 1562);
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

	// (47:10) {#if publishing}
	function create_if_block_3(component, ctx) {
		var div2, text0_value = __("publish / progress / please-wait"), text0, text1, div1, div0, div0_class_value, div2_class_value;

		return {
			c: function create() {
				div2 = createElement("div");
				text0 = createText(text0_value);
				text1 = createText("\n        ");
				div1 = createElement("div");
				div0 = createElement("div");
				div0.className = div0_class_value = "bar " + (ctx.progress < 1 ? '' : 'bar-success') + " svelte-1njbtly";
				addLoc(div0, file$2, 50, 12, 1864);
				div1.className = "progress progress-striped active svelte-1njbtly";
				addLoc(div1, file$2, 49, 8, 1805);
				div2.className = div2_class_value = "alert " + (ctx.progress < 1 ? 'alert-info' : 'alert-success') + " publishing" + " svelte-1njbtly";
				addLoc(div2, file$2, 47, 4, 1667);
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
				if ((changed.progress) && div0_class_value !== (div0_class_value = "bar " + (ctx.progress < 1 ? '' : 'bar-success') + " svelte-1njbtly")) {
					div0.className = div0_class_value;
				}

				if ((changed.progress) && div2_class_value !== (div2_class_value = "alert " + (ctx.progress < 1 ? 'alert-info' : 'alert-success') + " publishing" + " svelte-1njbtly")) {
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

	// (68:24) {#each plugin_shareurls as tpl}
	function create_each_block_3(component, ctx) {
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
				input.className = "svelte-1njbtly";
				addLoc(input, file$2, 69, 29, 2734);
				label.className = "radio";
				addLoc(label, file$2, 68, 24, 2684);
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

	// (90:24) {#each embed_templates as tpl}
	function create_each_block_2(component, ctx) {
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
				input.className = "svelte-1njbtly";
				addLoc(input, file$2, 90, 45, 3588);
				label.className = "radio";
				addLoc(label, file$2, 90, 24, 3567);
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

	// (105:58) {#each embed_templates.slice(2) as tpl}
	function create_each_block_1(component, ctx) {
		var div, b, text0_value = ctx.tpl.title, text0, text1, text2, raw_value = ctx.tpl.text, raw_before;

		return {
			c: function create() {
				div = createElement("div");
				b = createElement("b");
				text0 = createText(text0_value);
				text1 = createText(":");
				text2 = createText(" ");
				raw_before = createElement('noscript');
				addLoc(b, file$2, 105, 25, 4421);
				addLoc(div, file$2, 105, 20, 4416);
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

	// (120:12) {#if exportIntro}
	function create_if_block_2(component, ctx) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				addLoc(p, file$2, 120, 12, 4807);
			},

			m: function mount(target, anchor) {
				insert(target, p, anchor);
				p.innerHTML = ctx.exportIntro;
			},

			p: function update(changed, ctx) {
				if (changed.exportIntro) {
					p.innerHTML = ctx.exportIntro;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(p);
				}
			}
		};
	}

	// (126:49) {#if action}
	function create_if_block$2(component, ctx) {
		var li, a, i, i_class_value, span, raw_value = ctx.action.title, a_href_value, text, li_class_value;

		var if_block = (ctx.action.banner && ctx.action.banner.text != "FALSE" && ctx.action.banner.text != "-") && create_if_block_1$1(component, ctx);

		return {
			c: function create() {
				li = createElement("li");
				a = createElement("a");
				i = createElement("i");
				span = createElement("span");
				text = createText("\n                ");
				if (if_block) if_block.c();
				i.className = i_class_value = "fa fa-" + ctx.action.icon + " svelte-1njbtly";
				addLoc(i, file$2, 128, 20, 5214);
				span.className = "title svelte-1njbtly";
				addLoc(span, file$2, 128, 55, 5249);

				a._svelte = { component, ctx };

				addListener(a, "click", click_handler);
				setAttribute(a, "role", "button");
				a.href = a_href_value = ctx.action.url ? ctx.action.url : '#'+ctx.action.id;
				addLoc(a, file$2, 127, 16, 5094);
				li.className = li_class_value = "action action-" + ctx.action.id + " " + (ctx.action.class||'') + " " + (ctx.action.id == ctx.active_action ? 'active':'') + " svelte-1njbtly";
				addLoc(li, file$2, 126, 12, 4977);
			},

			m: function mount(target, anchor) {
				insert(target, li, anchor);
				append(li, a);
				append(a, i);
				append(a, span);
				span.innerHTML = raw_value;
				append(li, text);
				if (if_block) if_block.m(li, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.sortedChartActions) && i_class_value !== (i_class_value = "fa fa-" + ctx.action.icon + " svelte-1njbtly")) {
					i.className = i_class_value;
				}

				if ((changed.sortedChartActions) && raw_value !== (raw_value = ctx.action.title)) {
					span.innerHTML = raw_value;
				}

				a._svelte.ctx = ctx;
				if ((changed.sortedChartActions) && a_href_value !== (a_href_value = ctx.action.url ? ctx.action.url : '#'+ctx.action.id)) {
					a.href = a_href_value;
				}

				if (ctx.action.banner && ctx.action.banner.text != "FALSE" && ctx.action.banner.text != "-") {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block_1$1(component, ctx);
						if_block.c();
						if_block.m(li, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if ((changed.sortedChartActions || changed.active_action) && li_class_value !== (li_class_value = "action action-" + ctx.action.id + " " + (ctx.action.class||'') + " " + (ctx.action.id == ctx.active_action ? 'active':'') + " svelte-1njbtly")) {
					li.className = li_class_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(li);
				}

				removeListener(a, "click", click_handler);
				if (if_block) if_block.d();
			}
		};
	}

	// (131:16) {#if action.banner && action.banner.text != "FALSE" && action.banner.text != "-"}
	function create_if_block_1$1(component, ctx) {
		var div, text_value = ctx.action.banner.text, text, div_style_value;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(text_value);
				div.className = "banner";
				div.style.cssText = div_style_value = ctx.action.banner.style;
				addLoc(div, file$2, 131, 16, 5432);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
			},

			p: function update(changed, ctx) {
				if ((changed.sortedChartActions) && text_value !== (text_value = ctx.action.banner.text)) {
					setData(text, text_value);
				}

				if ((changed.sortedChartActions) && div_style_value !== (div_style_value = ctx.action.banner.style)) {
					div.style.cssText = div_style_value;
				}
			},

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}
			}
		};
	}

	// (126:12) {#each sortedChartActions as action}
	function create_each_block(component, ctx) {
		var if_block_anchor;

		var if_block = (ctx.action) && create_if_block$2(component, ctx);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (ctx.action) {
					if (if_block) {
						if_block.p(changed, ctx);
					} else {
						if_block = create_if_block$2(component, ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},

			d: function destroy(detach) {
				if (if_block) if_block.d(detach);
				if (detach) {
					detachNode(if_block_anchor);
				}
			}
		};
	}

	function Publish(options) {
		this._debugName = '<Publish>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}
		if (!options.store) {
			throw new Error("<Publish> references store properties, but no store was provided");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(assign(this.store._init(["id","publicUrl","actions"]), data$2()), options.data);
		this.store._add(this, ["id","publicUrl","actions"]);

		this._recompute({ shareurl_type: 1, $id: 1, $publicUrl: 1, plugin_shareurls: 1, published: 1, chartActions: 1, $actions: 1 }, this._state);
		if (!('shareurl_type' in this._state)) console.warn("<Publish> was created without expected data property 'shareurl_type'");
		if (!('$id' in this._state)) console.warn("<Publish> was created without expected data property '$id'");
		if (!('$publicUrl' in this._state)) console.warn("<Publish> was created without expected data property '$publicUrl'");
		if (!('plugin_shareurls' in this._state)) console.warn("<Publish> was created without expected data property 'plugin_shareurls'");
		if (!('published' in this._state)) console.warn("<Publish> was created without expected data property 'published'");
		if (!('chartActions' in this._state)) console.warn("<Publish> was created without expected data property 'chartActions'");
		if (!('$actions' in this._state)) console.warn("<Publish> was created without expected data property '$actions'");
		if (!('publishHed' in this._state)) console.warn("<Publish> was created without expected data property 'publishHed'");
		if (!('publishIntro' in this._state)) console.warn("<Publish> was created without expected data property 'publishIntro'");
		if (!('publishing' in this._state)) console.warn("<Publish> was created without expected data property 'publishing'");
		if (!('needs_republish' in this._state)) console.warn("<Publish> was created without expected data property 'needs_republish'");
		if (!('progress' in this._state)) console.warn("<Publish> was created without expected data property 'progress'");
		if (!('publish_error' in this._state)) console.warn("<Publish> was created without expected data property 'publish_error'");

		if (!('embed_templates' in this._state)) console.warn("<Publish> was created without expected data property 'embed_templates'");
		if (!('embed_type' in this._state)) console.warn("<Publish> was created without expected data property 'embed_type'");
		if (!('embedCode' in this._state)) console.warn("<Publish> was created without expected data property 'embedCode'");
		if (!('copy_success' in this._state)) console.warn("<Publish> was created without expected data property 'copy_success'");
		if (!('beforeExport' in this._state)) console.warn("<Publish> was created without expected data property 'beforeExport'");
		if (!('exportHed' in this._state)) console.warn("<Publish> was created without expected data property 'exportHed'");
		if (!('exportIntro' in this._state)) console.warn("<Publish> was created without expected data property 'exportIntro'");

		if (!('active_action' in this._state)) console.warn("<Publish> was created without expected data property 'active_action'");
		if (!('Action' in this._state)) console.warn("<Publish> was created without expected data property 'Action'");
		this._bindingGroups = [[], []];
		this._intro = true;

		this._handlers.state = [onstate];

		this._handlers.destroy = [removeFromStore];

		onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment$2(this, this._state);

		this.root._oncreate.push(() => {
			oncreate.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Publish.prototype, protoDev);
	assign(Publish.prototype, methods$1);

	Publish.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('shareUrl' in newState && !this._updatingReadonlyProperty) throw new Error("<Publish>: Cannot set read-only property 'shareUrl'");
		if ('sortedChartActions' in newState && !this._updatingReadonlyProperty) throw new Error("<Publish>: Cannot set read-only property 'sortedChartActions'");
	};

	Publish.prototype._recompute = function _recompute(changed, state) {
		if (changed.shareurl_type || changed.$id || changed.$publicUrl || changed.plugin_shareurls || changed.published) {
			if (this._differs(state.shareUrl, (state.shareUrl = shareUrl(state)))) changed.shareUrl = true;
		}

		if (changed.chartActions || changed.$actions) {
			if (this._differs(state.sortedChartActions, (state.sortedChartActions = sortedChartActions(state)))) changed.sortedChartActions = true;
		}
	};

	var index = { Publish };

	return index;

}));
//# sourceMappingURL=publish.js.map
