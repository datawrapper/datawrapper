(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('Handsontable')) :
	typeof define === 'function' && define.amd ? define('svelte/describe', ['Handsontable'], factory) :
	(global.describe = factory(global.HOT));
}(this, (function (HOT) { 'use strict';

HOT = HOT && HOT.hasOwnProperty('default') ? HOT['default'] : HOT;

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

/* describe/Handsontable.html generated by Svelte v1.53.0 */
function currentResult(searchResults, searchIndex) {
    if (!searchResults || !searchResults.length) return null;
    const l = searchResults.length;
    if (searchIndex < 0 || searchIndex >= l) {
        while (searchIndex<0) searchIndex += l;
        if (searchIndex > l) searchIndex %= l;
    }
    console.log(searchResults[searchIndex]);
    return searchResults[searchIndex];
}

function data() {
    return {
        data: '',
        readonly: false,
        skipRows: 0,
        firstRowIsHeader: true,
        searchIndex: 0,
        transpose: false,
        search: '',
        searchResults: []
    };
}

var methods = {
    update() {
        const {data, transpose, firstRowIsHeader, skipRows, hot} = this.get();

        if (!data) return;

        // get chart
        const chart = this.store.get('dw_chart');

        // pass dataset through chart to apply changes and computed columns
        const ds = chart.dataset(dw.datasource.delimited({
            csv: data,
            transpose,
            firstRowIsHeader,
            skipRows
        }).parse()).dataset();

        this.set({columnOrder: ds.columnOrder()});
        console.log('col order 1', this.get('columnOrder'));

        // construct HoT data array
        const hot_data = [[]];
        ds.eachColumn(c => hot_data[0].push(c.title()));
        ds.eachRow(r => {
            const row = [];
            ds.eachColumn(col => row.push(col.val(r)));
            hot_data.push(row);
        });

        // pass data to hot
        hot.loadData(hot_data);

        hot.updateSettings({
            cells: (row, col) => {
                const {readonly} = this.get();
                return {
                    readOnly: readonly || (ds.column(col).isComputed && row === 0),
                    renderer: getCellRenderer(this, ds, HOT, {})
                    // rowHeaders: _range(hot_data.length).map(r => 'R'+r)
                };
            },
            manualColumnMove: []
        });
        hot.render();
    }
};

function oncreate() {

    const hot = new HOT(this.refs.hot, {
        data: [],
        rowHeaders: (i) => {
            const ti = hot.getPlugin('ColumnSorting').translateRow(i);
            return ti+1;
        },
        colHeaders: true,
        fixedRowsTop: 1,
        filters: true,
        dropdownMenu: true,
        startRows: 13,
        startCols: 8,
        fillHandle: false,
        stretchH: 'all',
        height: 400,
        manualColumnMove: true,
        selectionMode: 'range',
        // comments: true,
        // contextMenu: true,

        // sorting
        columnSorting: true,
        sortIndicator: true,
        sortFunction: function(sortOrder, columnMeta) {
            return function(a, b) {
                var plugin = hot.getPlugin('columnSorting');
                var sortFunction;

                if (a[0] === 0) return -1;

                switch (columnMeta.type) {
                    case 'date':
                        sortFunction = plugin.dateSort;
                        break;
                    case 'numeric':
                        sortFunction = plugin.numericSort;
                        break;
                    default:
                        sortFunction = plugin.defaultSort;
                }

                return sortFunction(sortOrder, columnMeta)(a, b);
            };
        },

        // search
        search: 'search'
    });

    window.HT = hot;
    console.log(hot, window.HT);
    this.set({hot});

    HOT.hooks.add('afterSetDataAtCell', (a,b,c,d) => {
        console.log('afterSetDataAtCell', a,b,c,d);
        // this.set({table});
    });

    HOT.hooks.add('afterColumnMove', (srcColumns, tgtIndex) => {
        if (!srcColumns.length) return;
        const {columnOrder} = this.get();
        const newOrder = columnOrder.slice(0);
        const after = columnOrder[tgtIndex];
        const elements = newOrder.splice(srcColumns[0], srcColumns.length);
        const insertAt = after ? newOrder.indexOf(after) : newOrder.length;
        newOrder.splice(insertAt, 0, ...elements);
        this.store.get('dw_chart').set('metadata.data.column-order', newOrder.slice(0));
        this.set({columnOrder: newOrder});
        // update selection
        HOT.hooks.once('afterRender', () => {
            setTimeout(() => {
                hot.selectCell(0, insertAt, hot.countRows()-1, insertAt+elements.length-1);
            }, 10);
        });
        this.update();
    });

    this.observe('data', () => this.update());

    this.observe('search', (query) => {
        const searchResults = hot.search.query(query);
        this.set({searchResults});
        hot.render();
    });

    this.observe('currentResult', (res) => {
        // console.log('cur search res', res);
        if (!res || !hot) return;
        // this is a weird hack to deal with HoT's problems to scroll
        // all the way down after hot.scrollViewportTo(hot.countRows()-1, res.col);
        // the first scrollViewportTo will trigger a render event
        hot.render(); // to update the hightlight colors
        hot.scrollViewportTo(res.row, res.col);
        setTimeout(() => {
            // one more time
            hot.scrollViewportTo(res.row, res.col);
        }, 100);
    });

}

function getCellRenderer(app, dataset, Handsontable, metadata) {
    const colTypeIcons = {
        date: 'fa fa-clock-o'
    };
    function HtmlCellRender(instance, TD, row, col, prop, value, cellProperties) {
        var escaped = dw.utils.purifyHtml(Handsontable.helper.stringify(value));
        TD.innerHTML = escaped; // this is faster than innerHTML. See: https://github.com/warpech/jquery-handsontable/wiki/JavaScript-&-DOM-performance-tips
    }
    return function(instance, td, row, col, prop, value, cellProperties) {
        const column = dataset.column(col);
        const {searchResults, currentResult} = app.get();
        if (row > 0) {
            var formatter = chart.columnFormatter(column);
            value = formatter(column.val(row - 1), true);
        }
        if (parseInt(value) < 0) { // if row contains negative number
            td.classList.add('negative');
        }
        td.classList.add(column.type()+'Type');

        if (row === 0) {
            td.classList.add('firstRow');
            if (colTypeIcons[column.type()]) {
                value = '<i class="'+colTypeIcons[column.type()]+'"></i> ' + value;
            }
        } else {
            td.classList.add(row % 2 ? 'oddRow' : 'evenRow');
        }
        // if (metadata.columnFormat.get(column.name()).ignore) {
        //     td.classList.add('ignored');
        // }
        // if(selectedColumns.indexOf(col) > -1) {
        //     td.classList.add('area'); //add blue area background if this cell is in selected column
        // }
        searchResults.forEach(res => {
            if (res.row == row && res.col == col) {
                td.classList.add('htSearchResult');
            }
        });
        if (currentResult && currentResult.row == row && currentResult.col == col) {
            td.classList.add('htCurrentSearchResult');
        }
        if (row > 0 && !column.type(true).isValid(column.val(row-1))) {
            td.classList.add('parsingError');
        }
        if (cellProperties.readOnly) td.classList.add('readOnly');

        if (chart.dataCellChanged(col, row)) {
            td.classList.add('changed');
        }
        Reflect.apply(HtmlCellRender, this, arguments);
    };
}

function create_main_fragment(state, component) {
	var div;

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div.id = "data-preview";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			component.refs.hot = div;
		},

		p: noop,

		u: function unmount() {
			detachNode(div);
		},

		d: function destroy$$1() {
			if (component.refs.hot === div) component.refs.hot = null;
		}
	};
}

function Handsontable_1(options) {
	this._debugName = '<Handsontable_1>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this.refs = {};
	this._state = assign(data(), options.data);
	this._recompute({ searchResults: 1, searchIndex: 1 }, this._state);
	if (!('searchResults' in this._state)) console.warn("<Handsontable_1> was created without expected data property 'searchResults'");
	if (!('searchIndex' in this._state)) console.warn("<Handsontable_1> was created without expected data property 'searchIndex'");

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

assign(Handsontable_1.prototype, methods, protoDev);

Handsontable_1.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('currentResult' in newState && !this._updatingReadonlyProperty) throw new Error("<Handsontable_1>: Cannot set read-only property 'currentResult'");
};

Handsontable_1.prototype._recompute = function _recompute(changed, state) {
	if (changed.searchResults || changed.searchIndex) {
		if (differs(state.currentResult, (state.currentResult = currentResult(state.searchResults, state.searchIndex)))) changed.currentResult = true;
	}
};

/* controls/Checkbox.html generated by Svelte v1.53.0 */
function create_main_fragment$1(state, component) {
	var div, label, input, text, text_1;

	function input_change_handler() {
		component.set({ value: input.checked });
	}

	return {
		c: function create() {
			div = createElement("div");
			label = createElement("label");
			input = createElement("input");
			text = createText(" ");
			text_1 = createText(state.label);
			this.h();
		},

		h: function hydrate() {
			addListener(input, "change", input_change_handler);
			input.type = "checkbox";
			label.className = "checkbox";
			setStyle(label, "text-align", "left");
			setStyle(label, "width", "100%");
			setStyle(label, "position", "relative");
			setStyle(label, "left", "0");
			div.className = "control-group vis-option-group vis-option-type-checkbox";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(label, div);
			appendNode(input, label);

			input.checked = state.value;

			appendNode(text, label);
			appendNode(text_1, label);
		},

		p: function update(changed, state) {
			input.checked = state.value;
			if (changed.label) {
				text_1.data = state.label;
			}
		},

		u: function unmount() {
			detachNode(div);
		},

		d: function destroy$$1() {
			removeListener(input, "change", input_change_handler);
		}
	};
}

function Checkbox(options) {
	this._debugName = '<Checkbox>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign({}, options.data);
	if (!('value' in this._state)) console.warn("<Checkbox> was created without expected data property 'value'");
	if (!('label' in this._state)) console.warn("<Checkbox> was created without expected data property 'label'");

	this._fragment = create_main_fragment$1(this._state, this);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);
	}
}

assign(Checkbox.prototype, protoDev);

Checkbox.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* describe/App.html generated by Svelte v1.53.0 */
function searchIndexSafe(searchIndex, searchResults) {
    if (searchIndex<0) searchIndex+=searchResults.length;
    searchIndex = searchIndex % searchResults.length;
    return searchIndex;
}

function data$1() {
    return {
        search: '',
        chartData: '',
        transpose: false,
        firstRowIsHeader: true,
        searchIndex: 0,
        searchResults: []
    };
}

var methods$1 = {
    nextResult (diff) {
        let {searchIndex, searchResults} = this.get();
        searchIndex += diff;
        if (searchIndex<0) searchIndex+=searchResults.length;
        searchIndex = searchIndex % searchResults.length;
        this.set({searchIndex});
    },
    keyPress (event) {
        if (event.key == 'F3') this.nextResult(event.shiftKey ? -1 : 1);
    },
    toggleTranspose() {
        this.set({transpose: !this.get('transpose')});
    }
};

function oncreate$1() {
    console.log('chart', this.store.get('dw_chart'));
    window.addEventListener('keypress', (event) => {
        console.log('event',event);
        if (event.ctrlKey && event.key == 'f') {
            console.log('search!');
            event.preventDefault();
            if (this.refs.search != window.document.activeElement) {
                this.refs.search.focus();
            } else {
                this.nextResult(+1);
            }
        }
    });
}

function encapsulateStyles(node) {
	setAttribute(node, "svelte-771273718", "");
}

function create_main_fragment$2(state, component) {
	var div, div_1, div_2, h3, text_value = "Make sure the data looks right", text, text_1, p, text_2_value = "Please make sure that Datawrapper interprets your data correctly. In the table number columns should be shown in blue, dates in green and text in black.", text_2, text_3, checkbox_updating = {}, text_4, checkbox_1_updating = {}, text_6, div_3, div_4, input, input_updating = false, input_placeholder_value, text_7, div_5, button, text_8, button_1, text_11, div_6, text_13, handsontable_updating = {}, text_14, div_7, button_2, text_15_value = "Transpose dataset", text_15, text_16, button_3, i_2, text_17, text_18_value = "Add column", text_18, text_19, text_20, button_4, i_3, text_21, text_22_value = "Revert changes", text_22, text_23;

	var checkbox_initial_data = { label: "First row as label" };
	if ('firstRowIsHeader' in state) {
		checkbox_initial_data.value = state.firstRowIsHeader;
		checkbox_updating.value = true;
	}
	var checkbox = new Checkbox({
		root: component.root,
		data: checkbox_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!checkbox_updating.value && changed.value) {
				newState.firstRowIsHeader = childState.value;
			}
			checkbox_updating = assign({}, changed);
			component._set(newState);
			checkbox_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		var state = component.get(), childState = checkbox.get(), newState = {};
		if (!childState) return;
		if (!checkbox_updating.value) {
			newState.firstRowIsHeader = childState.value;
		}
		checkbox_updating = { value: true };
		component._set(newState);
		checkbox_updating = {};
	});

	var checkbox_1_initial_data = { label: "transpose" };
	if ('transpose' in state) {
		checkbox_1_initial_data.value = state.transpose;
		checkbox_1_updating.value = true;
	}
	var checkbox_1 = new Checkbox({
		root: component.root,
		data: checkbox_1_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!checkbox_1_updating.value && changed.value) {
				newState.transpose = childState.value;
			}
			checkbox_1_updating = assign({}, changed);
			component._set(newState);
			checkbox_1_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		var state = component.get(), childState = checkbox_1.get(), newState = {};
		if (!childState) return;
		if (!checkbox_1_updating.value) {
			newState.transpose = childState.value;
		}
		checkbox_1_updating = { value: true };
		component._set(newState);
		checkbox_1_updating = {};
	});

	function input_input_handler() {
		input_updating = true;
		component.set({ search: input.value });
		input_updating = false;
	}

	function keypress_handler(event) {
		component.keyPress(event);
	}

	function click_handler(event) {
		component.nextResult(-1);
	}

	function click_handler_1(event) {
		component.nextResult(+1);
	}

	var current_block_type = select_block_type(state);
	var if_block = current_block_type && current_block_type(state, component);

	var handsontable_initial_data = {};
	if ('chartData' in state) {
		handsontable_initial_data.data = state.chartData;
		handsontable_updating.data = true;
	}
	if ('transpose' in state) {
		handsontable_initial_data.transpose = state.transpose
                ;
		handsontable_updating.transpose = true;
	}
	if ('firstRowIsHeader' in state) {
		handsontable_initial_data.firstRowIsHeader = state.firstRowIsHeader
                ;
		handsontable_updating.firstRowIsHeader = true;
	}
	if ('search' in state) {
		handsontable_initial_data.search = state.search
                ;
		handsontable_updating.search = true;
	}
	if ('searchResults' in state) {
		handsontable_initial_data.searchResults = state.searchResults
                ;
		handsontable_updating.searchResults = true;
	}
	if ('searchIndex' in state) {
		handsontable_initial_data.searchIndex = state.searchIndex ;
		handsontable_updating.searchIndex = true;
	}
	var handsontable = new Handsontable_1({
		root: component.root,
		data: handsontable_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!handsontable_updating.data && changed.data) {
				newState.chartData = childState.data;
			}

			if (!handsontable_updating.transpose && changed.transpose) {
				newState.transpose = childState.transpose;
			}

			if (!handsontable_updating.firstRowIsHeader && changed.firstRowIsHeader) {
				newState.firstRowIsHeader = childState.firstRowIsHeader;
			}

			if (!handsontable_updating.search && changed.search) {
				newState.search = childState.search;
			}

			if (!handsontable_updating.searchResults && changed.searchResults) {
				newState.searchResults = childState.searchResults;
			}

			if (!handsontable_updating.searchIndex && changed.searchIndex) {
				newState.searchIndex = childState.searchIndex;
			}
			handsontable_updating = assign({}, changed);
			component._set(newState);
			handsontable_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		var state = component.get(), childState = handsontable.get(), newState = {};
		if (!childState) return;
		if (!handsontable_updating.data) {
			newState.chartData = childState.data;
		}

		if (!handsontable_updating.transpose) {
			newState.transpose = childState.transpose;
		}

		if (!handsontable_updating.firstRowIsHeader) {
			newState.firstRowIsHeader = childState.firstRowIsHeader;
		}

		if (!handsontable_updating.search) {
			newState.search = childState.search;
		}

		if (!handsontable_updating.searchResults) {
			newState.searchResults = childState.searchResults;
		}

		if (!handsontable_updating.searchIndex) {
			newState.searchIndex = childState.searchIndex;
		}
		handsontable_updating = { data: true, transpose: true, firstRowIsHeader: true, search: true, searchResults: true, searchIndex: true };
		component._set(newState);
		handsontable_updating = {};
	});

	function click_handler_2(event) {
		component.toggleTranspose();
	}

	return {
		c: function create() {
			div = createElement("div");
			div_1 = createElement("div");
			div_2 = createElement("div");
			h3 = createElement("h3");
			text = createText(text_value);
			text_1 = createText("\n\n            ");
			p = createElement("p");
			text_2 = createText(text_2_value);
			text_3 = createText("\n\n            ");
			checkbox._fragment.c();
			text_4 = createText("\n            ");
			checkbox_1._fragment.c();
			text_6 = createText("\n        ");
			div_3 = createElement("div");
			div_4 = createElement("div");
			input = createElement("input");
			text_7 = createText("\n                ");
			div_5 = createElement("div");
			button = createElement("button");
			button.innerHTML = "<i class=\"fa fa-chevron-up\"></i>";
			text_8 = createText("\n                  ");
			button_1 = createElement("button");
			button_1.innerHTML = "<i class=\"fa fa-chevron-down\"></i>";
			text_11 = createText("\n\n            ");
			div_6 = createElement("div");
			if (if_block) if_block.c();
			text_13 = createText("\n\n            ");
			handsontable._fragment.c();
			text_14 = createText("\n\n            ");
			div_7 = createElement("div");
			button_2 = createElement("button");
			text_15 = createText(text_15_value);
			text_16 = createText("\n                ");
			button_3 = createElement("button");
			i_2 = createElement("i");
			text_17 = createText(" ");
			text_18 = createText(text_18_value);
			text_19 = createText("...");
			text_20 = createText("\n\n                ");
			button_4 = createElement("button");
			i_3 = createElement("i");
			text_21 = createText(" ");
			text_22 = createText(text_22_value);
			text_23 = createText("...");
			this.h();
		},

		h: function hydrate() {
			h3.className = "first";
			div_2.className = "span4";
			addListener(input, "input", input_input_handler);
			input.type = "text";
			input.placeholder = input_placeholder_value = "Search data table";
			addListener(input, "keypress", keypress_handler);
			button.className = "btn";
			addListener(button, "click", click_handler);
			button_1.className = "btn";
			addListener(button_1, "click", click_handler_1);
			div_5.className = "btn-group";
			div_4.className = "input-append";
			encapsulateStyles(div_6);
			div_6.className = "results";
			encapsulateStyles(div_7);
			button_2.className = "btn transpose";
			addListener(button_2, "click", click_handler_2);
			i_2.className = "fa fa-calculator";
			button_3.className = "btn computed-columns";
			i_3.className = "fa fa-undo";
			button_4.className = "btn disabled";
			button_4.id = "reset-data-changes";
			div_7.className = "buttons below-table pull-right";
			div_3.className = "span8";
			div_1.className = "row";
			div.className = "chart-editor";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(div_1, div);
			appendNode(div_2, div_1);
			appendNode(h3, div_2);
			appendNode(text, h3);
			appendNode(text_1, div_2);
			appendNode(p, div_2);
			appendNode(text_2, p);
			appendNode(text_3, div_2);
			checkbox._mount(div_2, null);
			appendNode(text_4, div_2);
			checkbox_1._mount(div_2, null);
			appendNode(text_6, div_1);
			appendNode(div_3, div_1);
			appendNode(div_4, div_3);
			appendNode(input, div_4);
			component.refs.search = input;

			input.value = state.search;

			appendNode(text_7, div_4);
			appendNode(div_5, div_4);
			appendNode(button, div_5);
			appendNode(text_8, div_5);
			appendNode(button_1, div_5);
			appendNode(text_11, div_3);
			appendNode(div_6, div_3);
			if (if_block) if_block.m(div_6, null);
			appendNode(text_13, div_3);
			handsontable._mount(div_3, null);
			appendNode(text_14, div_3);
			appendNode(div_7, div_3);
			appendNode(button_2, div_7);
			appendNode(text_15, button_2);
			appendNode(text_16, div_7);
			appendNode(button_3, div_7);
			appendNode(i_2, button_3);
			appendNode(text_17, button_3);
			appendNode(text_18, button_3);
			appendNode(text_19, button_3);
			appendNode(text_20, div_7);
			appendNode(button_4, div_7);
			appendNode(i_3, button_4);
			appendNode(text_21, button_4);
			appendNode(text_22, button_4);
			appendNode(text_23, button_4);
		},

		p: function update(changed, state) {
			var checkbox_changes = {};
			checkbox_changes.label = "First row as label";
			if (!checkbox_updating.value && changed.firstRowIsHeader) {
				checkbox_changes.value = state.firstRowIsHeader;
				checkbox_updating.value = true;
			}
			checkbox._set(checkbox_changes);
			checkbox_updating = {};

			var checkbox_1_changes = {};
			if (!checkbox_1_updating.value && changed.transpose) {
				checkbox_1_changes.value = state.transpose;
				checkbox_1_updating.value = true;
			}
			checkbox_1._set(checkbox_1_changes);
			checkbox_1_updating = {};

			if (!input_updating) input.value = state.search;

			if (current_block_type === (current_block_type = select_block_type(state)) && if_block) {
				if_block.p(changed, state);
			} else {
				if (if_block) {
					if_block.u();
					if_block.d();
				}
				if_block = current_block_type && current_block_type(state, component);
				if (if_block) if_block.c();
				if (if_block) if_block.m(div_6, null);
			}

			var handsontable_changes = {};
			if (!handsontable_updating.data && changed.chartData) {
				handsontable_changes.data = state.chartData;
				handsontable_updating.data = true;
			}
			if (!handsontable_updating.transpose && changed.transpose) {
				handsontable_changes.transpose = state.transpose
                ;
				handsontable_updating.transpose = true;
			}
			if (!handsontable_updating.firstRowIsHeader && changed.firstRowIsHeader) {
				handsontable_changes.firstRowIsHeader = state.firstRowIsHeader
                ;
				handsontable_updating.firstRowIsHeader = true;
			}
			if (!handsontable_updating.search && changed.search) {
				handsontable_changes.search = state.search
                ;
				handsontable_updating.search = true;
			}
			if (!handsontable_updating.searchResults && changed.searchResults) {
				handsontable_changes.searchResults = state.searchResults
                ;
				handsontable_updating.searchResults = true;
			}
			if (!handsontable_updating.searchIndex && changed.searchIndex) {
				handsontable_changes.searchIndex = state.searchIndex ;
				handsontable_updating.searchIndex = true;
			}
			handsontable._set(handsontable_changes);
			handsontable_updating = {};

			
		},

		u: function unmount() {
			detachNode(div);
			if (if_block) if_block.u();
		},

		d: function destroy$$1() {
			checkbox.destroy(false);
			checkbox_1.destroy(false);
			removeListener(input, "input", input_input_handler);
			removeListener(input, "keypress", keypress_handler);
			if (component.refs.search === input) component.refs.search = null;
			removeListener(button, "click", click_handler);
			removeListener(button_1, "click", click_handler_1);
			if (if_block) if_block.d();
			handsontable.destroy(false);
			removeListener(button_2, "click", click_handler_2);
		}
	};
}

// (23:12) {{#if searchResults.length > 0}}
function create_if_block(state, component) {
	var text_value = state.searchIndexSafe+1, text, text_1, text_2_value = state.searchResults.length, text_2, text_3;

	return {
		c: function create() {
			text = createText(text_value);
			text_1 = createText(" of ");
			text_2 = createText(text_2_value);
			text_3 = createText(" cells matching");
		},

		m: function mount(target, anchor) {
			insertNode(text, target, anchor);
			insertNode(text_1, target, anchor);
			insertNode(text_2, target, anchor);
			insertNode(text_3, target, anchor);
		},

		p: function update(changed, state) {
			if ((changed.searchIndexSafe) && text_value !== (text_value = state.searchIndexSafe+1)) {
				text.data = text_value;
			}

			if ((changed.searchResults) && text_2_value !== (text_2_value = state.searchResults.length)) {
				text_2.data = text_2_value;
			}
		},

		u: function unmount() {
			detachNode(text);
			detachNode(text_1);
			detachNode(text_2);
			detachNode(text_3);
		},

		d: noop
	};
}

// (25:29) 
function create_if_block_1(state, component) {
	var text;

	return {
		c: function create() {
			text = createText("No matches found");
		},

		m: function mount(target, anchor) {
			insertNode(text, target, anchor);
		},

		p: noop,

		u: function unmount() {
			detachNode(text);
		},

		d: noop
	};
}

function select_block_type(state) {
	if (state.searchResults.length > 0) return create_if_block;
	if (state.search) return create_if_block_1;
	return null;
}

function App(options) {
	this._debugName = '<App>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this.refs = {};
	this._state = assign(data$1(), options.data);
	this._recompute({ searchIndex: 1, searchResults: 1 }, this._state);
	if (!('searchIndex' in this._state)) console.warn("<App> was created without expected data property 'searchIndex'");
	if (!('searchResults' in this._state)) console.warn("<App> was created without expected data property 'searchResults'");
	if (!('firstRowIsHeader' in this._state)) console.warn("<App> was created without expected data property 'firstRowIsHeader'");
	if (!('transpose' in this._state)) console.warn("<App> was created without expected data property 'transpose'");
	if (!('search' in this._state)) console.warn("<App> was created without expected data property 'search'");
	if (!('searchIndexSafe' in this._state)) console.warn("<App> was created without expected data property 'searchIndexSafe'");
	if (!('chartData' in this._state)) console.warn("<App> was created without expected data property 'chartData'");

	var _oncreate = oncreate$1.bind(this);

	if (!options.root) {
		this._oncreate = [_oncreate];
		this._beforecreate = [];
		this._aftercreate = [];
	} else {
	 	this.root._oncreate.push(_oncreate);
	 }

	this._fragment = create_main_fragment$2(this._state, this);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(App.prototype, methods$1, protoDev);

App.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('searchIndexSafe' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'searchIndexSafe'");
};

App.prototype._recompute = function _recompute(changed, state) {
	if (changed.searchIndex || changed.searchResults) {
		if (differs(state.searchIndexSafe, (state.searchIndexSafe = searchIndexSafe(state.searchIndex, state.searchResults)))) changed.searchIndexSafe = true;
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

const data$2 = {
    chart: {
        id: ''
    },
    readonly: false,
    chartData: '',
    transpose: false,
    firstRowIsHeader: true,
    skipRows: 0
};

var main = { App, store, data: data$2 };

return main;

})));
