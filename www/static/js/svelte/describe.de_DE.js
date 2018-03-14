(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('Handsontable'), require('cm/lib/codemirror'), require('cm/mode/javascript/javascript'), require('cm/addon/mode/simple')) :
	typeof define === 'function' && define.amd ? define('svelte/describe', ['Handsontable', 'cm/lib/codemirror', 'cm/mode/javascript/javascript', 'cm/addon/mode/simple'], factory) :
	(global.describe = factory(global.HOT,global.CodeMirror));
}(this, (function (HOT,CodeMirror) { 'use strict';

HOT = HOT && HOT.hasOwnProperty('default') ? HOT['default'] : HOT;
CodeMirror = CodeMirror && CodeMirror.hasOwnProperty('default') ? CodeMirror['default'] : CodeMirror;

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
        activeColumn: null,
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

        // construct HoT data array
        const hot_data = [[]];
        ds.eachColumn(c => hot_data[0].push(c.title()));

        ds.eachRow(r => {
            const row = [];
            ds.eachColumn(col => row.push(col.raw(r)));
            hot_data.push(row);
        });

        // pass data to hot
        hot.loadData(hot_data);

        hot.updateSettings({
            cells: (row, col) => {
                const {readonly} = this.get();
                return {
                    readOnly: readonly || (ds.numColumns() > col && ds.column(col).isComputed && row === 0),
                    renderer: getCellRenderer(this, ds, HOT, {})
                };
            },
            manualColumnMove: []
        });

        this.set({ds});
        this.set({has_changes: chart.get('metadata.data.changes', []).length > 0});

        hot.render();
    },
    dataChanged (cells) {
        const {hot} = this.get();
        let changed = false;
        cells.forEach(([row, col, old_val, new_val]) => {
            if (old_val != new_val) {
                const chart = this.store.get('dw_chart');
                const {transpose} = this.get();
                const changes = chart.get('metadata.data.changes');
                row = hot.toPhysicalRow(row);
                if (transpose) {
                    // swap row and col
                    const tmp = row;
                    row = col;
                    col = tmp;
                }
                // store new change
                changes.push({
                    row, column: col, value: new_val, time: (new Date()).getTime()
                });
                chart.set('metadata.data.changes', changes);
                changed = true;
            }
        });
        if (changed) {
            setTimeout(() => {
                this.update();
                chart.save();
            }, 100);
        }
    },
    columnMoved (srcColumns, tgtIndex) {
        const {hot} = this.get();
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
    },
    updateHeight () {
        const h = document.querySelector('.ht_master.handsontable .wtHolder .wtHider').getBoundingClientRect().height;
        this.refs.hot.style.height = Math.min(400, h+10)+'px';
    },
    checkRange (r,c,r2,c2) {
        // check if
        // 1. only a single column is selected, and
        // 2. the range starts at the first row, and
        // 3. the range extends through he last row
        const {hot} = this.get();
        if (c == c2 && r === 0 && r2 == hot.countRows()-1) {
            // const chart = this.store.get('dw_chart');
            // this.set({activeColumn: chart.dataset().column(c)});
            return;
        }
        this.set({activeColumn:null});
    },
    initCustomEvents () {
        // wait a bit to make sure HoT is rendered
        setTimeout(() => {
            const {hot} = this.get();
            // catch click events on A,B,C,D... header row
            this.refs.hot.querySelectorAll('.htCore thead th+th').forEach(th => {
                th.addEventListener('click', evt => {
                    // reset the HoT selection
                    hot.deselectCell();
                    evt.preventDefault();
                    evt.stopPropagation();
                    // find out which data column we're in
                    const k = th.parentNode.children.length;
                    let th_i = -1;
                    // (stupid HTMLCollection has no indexOf)
                    for (let i=0; i<k; i++) {
                        if (th.parentNode.children.item(i) == th) {
                            th_i = i;
                            break;
                        }
                    }
                    // find column index
                    const col_i = this.refs.hot.querySelector(`.htCore tbody tr:first-child td:nth-child(${th_i+1})`).dataset.column;
                    const chart = this.store.get('dw_chart');
                    const {activeColumn} = this.get();
                    const newActive = chart.dataset().column(+col_i);
                    // set active column (or unset if it's already set)
                    this.set({activeColumn: newActive == activeColumn ? false : newActive});
                });
            });
        }, 500);
    }
};

function oncreate() {

    HOT.hooks.once('afterRender', () => this.initCustomEvents());

    const chart = this.store.get('dw_chart');

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
        autoColumnSize: {useHeaders: true},
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
        afterGetColHeader: (col, th) => {
            const {activeColumn, ds} = this.get();
            if (!ds) return;
            if (col && ds.column(col) == activeColumn) {
                th.classList.add('selected');
            }
            return;
            // console.log(chart.dataset().column(col), activeColumn, th);
            // if (selectedColumns.indexOf(col) !== -1) {
            //     TH.classList.add('selected');
            // }

            // var serie = getSeriesOfIndex(col);
            // if(metadata.columnFormat.get(serie).ignore) {
            //     TH.classList.add('ignored');
            // }
            // else {
            //     TH.classList.remove('ignored');
            // }
        },
        // search
        search: 'search'
    });

    window.HT = hot;
    this.set({hot});

    HOT.hooks.add('afterSetDataAtCell', (a) => this.dataChanged(a));
    HOT.hooks.add('afterColumnMove', (a,b) => this.columnMoved(a,b));
    HOT.hooks.add('afterRender', () => this.updateHeight());
    HOT.hooks.add('afterSelection', (r,c,r2,c2) => this.checkRange(r,c,r2,c2));

    // HOT.hooks.add()
    // $dataPreview.on('mousedown', '.ht_clone_top.handsontable th:has(.colHeader)', function (event) {
    //     start = getIndexOfTh(this);
    //     event.stopPropagation();
    //     $dataPreview.handsontable('deselectCell');

    //     if (selectedColumns.length == 1 && selectedColumns[0] == start) {
    //         // proceeding click on selected column header will unselect
    //         deselectColumns();
    //         $dataPreview.handsontable('render'); // refresh all cells and column headers
    //         showColumnSettings();
    //         return;
    //     }
    //     setTimeout(function() { //do it in timeout, so input blur has chance to run
    //         selectColumns(start);
    //     }, 0);
    // });

    this.observe('data', () => this.update());
    this.observe('transpose', () => this.update());
    this.observe('firstRowIsHeader', () => this.update());

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

    this.observe('activeColumn', () => hot.render());

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
        if (dataset.numColumns() <= col) return;
        const column = dataset.column(col);
        const {searchResults, currentResult, activeColumn} = app.get();
        row = instance.toPhysicalRow(row);
        if (row > 0) {
            var formatter = chart.columnFormatter(column);
            value = formatter(column.val(row - 1), true);
        }
        if (parseInt(value) < 0) { // if row contains negative number
            td.classList.add('negative');
        }
        td.classList.add(column.type()+'Type');

        if (column.type() == 'text' && value.length > 70) {
            value = value.substr(0,60)+'…';
        }

        if (row === 0) {
            td.classList.add('firstRow');
            if (colTypeIcons[column.type()]) {
                value = '<i class="'+colTypeIcons[column.type()]+'"></i> ' + value;
            }
            td.dataset.column = col;
        } else {
            td.classList.add(row % 2 ? 'oddRow' : 'evenRow');
        }
        // if (metadata.columnFormat.get(column.name()).ignore) {
        //     td.classList.add('ignored');
        // }
        // if(selectedColumns.indexOf(col) > -1) {
        //     td.classList.add('area'); //add blue area background if this cell is in selected column
        // }
        if (activeColumn && activeColumn == column) {
            td.classList.add('area');
        }
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
        HtmlCellRender(instance, td, row, col, prop, value, cellProperties);
        // Reflect.apply(HtmlCellRender, this, arguments);
    };
}

function create_main_fragment(state, component) {
	var div, text, text_1;

	return {
		c: function create() {
			div = createElement("div");
			text = createText("\n\n");
			text_1 = createText(state.activeColumn);
			this.h();
		},

		h: function hydrate() {
			div.id = "data-preview";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			component.refs.hot = div;
			insertNode(text, target, anchor);
			insertNode(text_1, target, anchor);
		},

		p: function update(changed, state) {
			if (changed.activeColumn) {
				text_1.data = state.activeColumn;
			}
		},

		u: function unmount() {
			detachNode(div);
			detachNode(text);
			detachNode(text_1);
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
	if (!('activeColumn' in this._state)) console.warn("<Handsontable_1> was created without expected data property 'activeColumn'");

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

/* describe/ComputedColumnEditor.html generated by Svelte v1.53.0 */
function metaColumns(columns) {
    if (!columns) return [];
    return columns.map(col => {
        return {
            key: column_name_to_var(col.name()),
            title: col.title()
        };
    });
}

var methods$1 = {
    insert (column) {
        const {cm} = this.get();
        cm.replaceSelection(column.key);
        cm.focus();
    }
};

function oncreate$1() {
    const cm = CodeMirror.fromTextArea(this.refs.code, {
        value: this.get('formula'),
        mode: 'simple'
    });

    window.CodeMirror = CodeMirror;

    this.set({cm});

    this.observe('formula', (formula) => {
        if (formula != cm.getValue()) cm.setValue(formula);
    });

    cm.on('change', (cm) => {
        this.set({formula: cm.getValue()});
    });

    cm.on('focus', () => this.fire('focus'));

    this.observe('metaColumns', (cols) => {
        var columns_regex = new RegExp(`(?:${cols.map(c=>c.key).join('|')})`);
        CodeMirror.defineSimpleMode("simplemode", {
            // The start state contains the rules that are intially used
            start: [
                // The regex matches the token, the token property contains the type
                {regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string"},
                // You can match multiple tokens at once. Note that the captured
                // groups must span the whole string in this case
                {regex: /(function)(\s+)([a-z$][\w$]*)/,
                 token: ["keyword", null, "keyword"]},
                // Rules are matched in the order in which they appear, so there is
                // no ambiguity between this one and the one above
                {regex: /(?:function|var|return|if|for|while|else|do|this)\b/,
                 token: "keyword"},
                {regex: /true|false|null|undefined/, token: "atom"},
                {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
                 token: "number"},
                {regex: /\/\/.*/, token: "comment"},
                {regex: /\/(?:[^\\]|\\.)*?\//, token: "variable-3"},
                // A next property will cause the mode to move to a different state
                {regex: /\/\*/, token: "comment", next: "comment"},
                {regex: /[-+\/*=<>!]+/, token: "operator"},
                // indent and dedent properties guide autoindentation
                {regex: /[\{\[\(]/, indent: true},
                {regex: /[\}\]\)]/, dedent: true},
                {regex: columns_regex, token: 'variable-2'},
                {regex: /[a-z$][\w$]*/, token: "variable"},
                // You can embed other modes with the mode property. This rule
                // causes all code between << and >> to be highlighted with the XML
                // mode.
                {regex: /<</, token: "meta", mode: {spec: "xml", end: />>/}}
            ],
            // The multi-line comment state.
            comment: [
                {regex: /.*?\*\//, token: "comment", next: "start"},
                {regex: /.*/, token: "comment"}
            ],
            // The meta property contains global information about the mode. It
            // can contain properties like lineComment, which are supported by
            // all modes, and also directives like dontIndentStates, which are
            // specific to simple modes.
            meta: {
                dontIndentStates: ["comment"],
                lineComment: "//"
            }
        });

        cm.setOption('mode', 'simplemode');
    });
}

function column_name_to_var(name) {
    // if you change this, change dw.chart.js as well
    return name.toString().toLowerCase()
        .replace(/\s+/g, '_')           // Replace spaces with _
        .replace(/[^\w-]+/g, '')       // Remove all non-word chars
        .replace(/-/g, '_')             // Replace - with single _
        .replace(/__+/g, '_')         // Replace multiple _ with single _
        .replace(/^_+/, '')             // Trim _ from start of text
        .replace(/_+$/, '')             // Trim _ from end of text
        .replace(/^(\d)/, '_$1')        // If first char is a number, prefix with _
        .replace(/(abstract|arguments|await|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|window|with|yield)/, '$1_'); // reserved keywords
}

function encapsulateStyles(node) {
	setAttribute(node, "svelte-836747283", "");
}

function create_main_fragment$1(state, component) {
	var div, h3, text, text_1_value = state.column.name(), text_1, text_2, text_3, p, text_4_value = "Die Werte in den Spalten können nach einer Formel berechnet werden, wie in Excel.", text_4, text_5, label, text_6_value = "computed columns / modal / name", text_6, text_7, input, input_updating = false, text_8, label_1, text_9_value = "Formel (JavaScript)", text_9, text_10, textarea, text_11, p_1, text_12_value = "Verfügbare Spalten", text_12, text_13, text_14, ul;

	function input_input_handler() {
		input_updating = true;
		component.set({ name: input.value });
		input_updating = false;
	}

	var metaColumns_1 = state.metaColumns;

	var each_blocks = [];

	for (var i = 0; i < metaColumns_1.length; i += 1) {
		each_blocks[i] = create_each_block(state, metaColumns_1, metaColumns_1[i], i, component);
	}

	return {
		c: function create() {
			div = createElement("div");
			h3 = createElement("h3");
			text = createText("Edit computed column \"");
			text_1 = createText(text_1_value);
			text_2 = createText("\"");
			text_3 = createText("\n    ");
			p = createElement("p");
			text_4 = createText(text_4_value);
			text_5 = createText("\n\n    ");
			label = createElement("label");
			text_6 = createText(text_6_value);
			text_7 = createText("\n    ");
			input = createElement("input");
			text_8 = createText("\n\n    ");
			label_1 = createElement("label");
			text_9 = createText(text_9_value);
			text_10 = createText("\n    ");
			textarea = createElement("textarea");
			text_11 = createText("\n\n    ");
			p_1 = createElement("p");
			text_12 = createText(text_12_value);
			text_13 = createText(":");
			text_14 = createText("\n\n    ");
			ul = createElement("ul");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			this.h();
		},

		h: function hydrate() {
			h3.className = "first";
			encapsulateStyles(label);
			addListener(input, "input", input_input_handler);
			input.type = "text";
			encapsulateStyles(label_1);
			textarea.className = "code";
			setStyle(p_1, "margin-top", "1em");
			encapsulateStyles(ul);
			ul.className = "col-select";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(h3, div);
			appendNode(text, h3);
			appendNode(text_1, h3);
			appendNode(text_2, h3);
			appendNode(text_3, div);
			appendNode(p, div);
			appendNode(text_4, p);
			appendNode(text_5, div);
			appendNode(label, div);
			appendNode(text_6, label);
			appendNode(text_7, div);
			appendNode(input, div);

			input.value = state.name;

			appendNode(text_8, div);
			appendNode(label_1, div);
			appendNode(text_9, label_1);
			appendNode(text_10, div);
			appendNode(textarea, div);
			component.refs.code = textarea;
			appendNode(text_11, div);
			appendNode(p_1, div);
			appendNode(text_12, p_1);
			appendNode(text_13, p_1);
			appendNode(text_14, div);
			appendNode(ul, div);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(ul, null);
			}
		},

		p: function update(changed, state) {
			if ((changed.column) && text_1_value !== (text_1_value = state.column.name())) {
				text_1.data = text_1_value;
			}

			if (!input_updating) input.value = state.name;

			var metaColumns_1 = state.metaColumns;

			if (changed.metaColumns) {
				for (var i = 0; i < metaColumns_1.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].p(changed, state, metaColumns_1, metaColumns_1[i], i);
					} else {
						each_blocks[i] = create_each_block(state, metaColumns_1, metaColumns_1[i], i, component);
						each_blocks[i].c();
						each_blocks[i].m(ul, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = metaColumns_1.length;
			}
		},

		u: function unmount() {
			detachNode(div);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			removeListener(input, "input", input_input_handler);
			if (component.refs.code === textarea) component.refs.code = null;

			destroyEach(each_blocks);
		}
	};
}

// (14:8) {{#each metaColumns as column}}
function create_each_block(state, metaColumns_1, column, column_index, component) {
	var li, text_value = column.key, text;

	return {
		c: function create() {
			li = createElement("li");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			encapsulateStyles(li);
			addListener(li, "click", click_handler);

			li._svelte = {
				component: component,
				metaColumns_1: metaColumns_1,
				column_index: column_index
			};
		},

		m: function mount(target, anchor) {
			insertNode(li, target, anchor);
			appendNode(text, li);
		},

		p: function update(changed, state, metaColumns_1, column, column_index) {
			if ((changed.metaColumns) && text_value !== (text_value = column.key)) {
				text.data = text_value;
			}

			li._svelte.metaColumns_1 = metaColumns_1;
			li._svelte.column_index = column_index;
		},

		u: function unmount() {
			detachNode(li);
		},

		d: function destroy$$1() {
			removeListener(li, "click", click_handler);
		}
	};
}

function click_handler(event) {
	var component = this._svelte.component;
	var metaColumns_1 = this._svelte.metaColumns_1, column_index = this._svelte.column_index, column = metaColumns_1[column_index];
	component.insert(column);
}

function ComputedColumnEditor(options) {
	this._debugName = '<ComputedColumnEditor>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this.refs = {};
	this._state = assign({}, options.data);
	this._recompute({ columns: 1 }, this._state);
	if (!('columns' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'columns'");
	if (!('column' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'column'");
	if (!('name' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'name'");
	if (!('metaColumns' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'metaColumns'");

	var _oncreate = oncreate$1.bind(this);

	if (!options.root) {
		this._oncreate = [_oncreate];
	} else {
	 	this.root._oncreate.push(_oncreate);
	 }

	this._fragment = create_main_fragment$1(this._state, this);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);

		callAll(this._oncreate);
	}
}

assign(ComputedColumnEditor.prototype, methods$1, protoDev);

ComputedColumnEditor.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('metaColumns' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'metaColumns'");
};

ComputedColumnEditor.prototype._recompute = function _recompute(changed, state) {
	if (changed.columns) {
		if (differs(state.metaColumns, (state.metaColumns = metaColumns(state.columns)))) changed.metaColumns = true;
	}
};

/* controls/Checkbox.html generated by Svelte v1.53.0 */
function data$1() {
    return {
        disabled: false
    }
}

function encapsulateStyles$1(node) {
	setAttribute(node, "svelte-1306209643", "");
}

function create_main_fragment$2(state, component) {
	var div, label, input, text, text_1, label_class_value;

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
			encapsulateStyles$1(label);
			encapsulateStyles$1(input);
			addListener(input, "change", input_change_handler);
			input.type = "checkbox";
			input.disabled = state.disabled;
			label.className = label_class_value = "checkbox " + (state.disabled? 'disabled' :'');
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
			if (changed.disabled) {
				input.disabled = state.disabled;
			}

			if (changed.label) {
				text_1.data = state.label;
			}

			if ((changed.disabled) && label_class_value !== (label_class_value = "checkbox " + (state.disabled? 'disabled' :''))) {
				label.className = label_class_value;
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
	this._state = assign(data$1(), options.data);
	if (!('disabled' in this._state)) console.warn("<Checkbox> was created without expected data property 'disabled'");
	if (!('value' in this._state)) console.warn("<Checkbox> was created without expected data property 'value'");
	if (!('label' in this._state)) console.warn("<Checkbox> was created without expected data property 'label'");

	this._fragment = create_main_fragment$2(this._state, this);

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

function customColumn(activeColumn) {
    return activeColumn && activeColumn.isComputed ? activeColumn : false;
}

function columnFormat(activeColumn) {
    return activeColumn && !activeColumn.isComputed ? activeColumn : false;
}

function columns(activeColumn) {
    if (!activeColumn) return [];
    try {
        const ds = chart.dataset();
        return ds.columns().filter(col => !col.isComputed);
    } catch(e) {
        return [];
    }
}

function data$2() {
    return {
        search: '',
        chartData: '',
        transpose: false,
        firstRowIsHeader: true,
        searchIndex: 0,
        activeColumn: false,
        customColumn: false,
        columnFormat: false,
        formula: '',
        searchResults: []
    };
}

var methods$2 = {
    nextResult (diff) {
        let {searchIndex, searchResults} = this.get();
        searchIndex += diff;
        if (searchIndex<0) searchIndex+=searchResults.length;
        searchIndex = searchIndex % searchResults.length;
        this.set({searchIndex});
    },
    keyPress (event) {
        if (event.key == 'F3' || event.key == 'Enter')
            this.nextResult(event.shiftKey ? -1 : 1);
    },
    toggleTranspose() {
        this.set({transpose: !this.get('transpose')});
    },
    revertChanges() {
        const chart = this.store.get('dw_chart');
        chart.set('metadata.data.changes', []);
        chart.saveSoon();
        this.refs.hot.update();
    },
    cmFocus () {
        setTimeout(() => {
            this.refs.hot.get('hot').render();
        }, 100);
    }
};

function oncreate$2() {
    window.addEventListener('keypress', (event) => {
        if (event.ctrlKey && event.key == 'f') {
            event.preventDefault();
            if (this.refs.search != window.document.activeElement) {
                this.refs.search.focus();
            } else {
                this.nextResult(+1);
            }
        }
    });
    const sync = (svelte_key, metadata_key) => {
        this.observe(svelte_key, (svelte_value) => {
            this.store.get('dw_chart').set(`metadata.${metadata_key}`, svelte_value);
        });
    };
    sync('transpose', 'data.transpose');
    sync('firstRowIsHeader', 'data.horizontal-header');

    this.observe('customColumn', (col, old) => {
        if (col && col != old) {
            const chart = this.store.get('dw_chart');
            const customCols = chart.get('metadata.describe.computed-columns', {});
            this.set({formula: customCols[col.name()] || ''});
        }
    });

    this.observe('formula', (formula) => {
        const {customColumn} = this.get();
        const chart = this.store.get('dw_chart');
        if (customColumn) {
            const customCols = chart.get('metadata.describe.computed-columns', {});
            customCols[customColumn.name()] = formula;
            chart.set('metadata.describe.computed-columns', customCols);
            chart.saveSoon();
            this.refs.hot.update();
        }
    });
}

function encapsulateStyles$2(node) {
	setAttribute(node, "svelte-1903720201", "");
}

function create_main_fragment$3(state, component) {
	var div, div_1, div_2, div_3, text_2, div_4, button, img, text_3, text_4_value = "Zeilen und Spalten vertauschen (transponieren)", text_4, text_5, div_5, i, text_6, div_6, input, input_updating = false, input_placeholder_value, input_class_value, text_7, text_9, text_11, handsontable_updating = {}, text_12, div_7, button_1, i_1, text_13, text_14_value = "Spalte hinzufügen", text_14, text_15, text_16, button_2, i_2, text_17, text_18_value = "Änderungen zurücksetzen", text_18, text_19, button_2_class_value;

	var current_block_type = select_block_type(state);
	var if_block = current_block_type(state, component);

	function click_handler(event) {
		component.toggleTranspose();
	}

	function input_input_handler() {
		input_updating = true;
		component.set({ search: input.value });
		input_updating = false;
	}

	function keypress_handler(event) {
		component.keyPress(event);
	}

	var if_block_2 = (state.searchResults.length > 0) && create_if_block_3(state, component);

	var if_block_3 = (state.search) && create_if_block_4(state, component);

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
	if ('activeColumn' in state) {
		handsontable_initial_data.activeColumn = state.activeColumn
                ;
		handsontable_updating.activeColumn = true;
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

			if (!handsontable_updating.activeColumn && changed.activeColumn) {
				newState.activeColumn = childState.activeColumn;
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

		if (!handsontable_updating.activeColumn) {
			newState.activeColumn = childState.activeColumn;
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
		handsontable_updating = { data: true, transpose: true, firstRowIsHeader: true, activeColumn: true, search: true, searchResults: true, searchIndex: true };
		component._set(newState);
		handsontable_updating = {};
	});

	component.refs.hot = handsontable;

	function click_handler_1(event) {
		component.revertChanges();
	}

	return {
		c: function create() {
			div = createElement("div");
			div_1 = createElement("div");
			div_2 = createElement("div");
			div_3 = createElement("div");
			if_block.c();
			text_2 = createText("\n        ");
			div_4 = createElement("div");
			button = createElement("button");
			img = createElement("img");
			text_3 = createText(" ");
			text_4 = createText(text_4_value);
			text_5 = createText("\n\n            ");
			div_5 = createElement("div");
			i = createElement("i");
			text_6 = createText("\n                ");
			div_6 = createElement("div");
			input = createElement("input");
			text_7 = createText("\n                    ");
			if (if_block_2) if_block_2.c();
			text_9 = createText("\n\n                ");
			if (if_block_3) if_block_3.c();
			text_11 = createText("\n\n            ");
			handsontable._fragment.c();
			text_12 = createText("\n\n            ");
			div_7 = createElement("div");
			button_1 = createElement("button");
			i_1 = createElement("i");
			text_13 = createText(" ");
			text_14 = createText(text_14_value);
			text_15 = createText("...");
			text_16 = createText("\n\n                ");
			button_2 = createElement("button");
			i_2 = createElement("i");
			text_17 = createText(" ");
			text_18 = createText(text_18_value);
			text_19 = createText("...");
			this.h();
		},

		h: function hydrate() {
			div_3.className = "sidebar";
			div_2.className = "span4";
			encapsulateStyles$2(div_4);
			encapsulateStyles$2(button);
			encapsulateStyles$2(img);
			img.src = "/static/css/chart-editor/transpose.png";
			button.className = "btn transpose";
			addListener(button, "click", click_handler);
			encapsulateStyles$2(div_5);
			encapsulateStyles$2(i);
			i.className = "fa fa-search";
			encapsulateStyles$2(input);
			addListener(input, "input", input_input_handler);
			input.type = "text";
			input.placeholder = input_placeholder_value = "Search data table";
			input.className = input_class_value = state.searchResults.length > 0?'with-results':'';
			addListener(input, "keypress", keypress_handler);
			div_6.className = "input-append";
			div_5.className = "search-box pull-right";
			encapsulateStyles$2(div_7);
			i_1.className = "fa fa-calculator";
			button_1.className = "btn computed-columns";
			encapsulateStyles$2(button_2);
			i_2.className = "fa fa-undo";
			button_2.className = button_2_class_value = "btn " + (state.has_changes?'':'disabled');
			button_2.id = "reset-data-changes";
			addListener(button_2, "click", click_handler_1);
			div_7.className = "buttons below-table pull-right";
			div_4.className = "span8";
			div_1.className = "row";
			div.className = "chart-editor";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(div_1, div);
			appendNode(div_2, div_1);
			appendNode(div_3, div_2);
			if_block.m(div_3, null);
			appendNode(text_2, div_1);
			appendNode(div_4, div_1);
			appendNode(button, div_4);
			appendNode(img, button);
			appendNode(text_3, button);
			appendNode(text_4, button);
			appendNode(text_5, div_4);
			appendNode(div_5, div_4);
			appendNode(i, div_5);
			appendNode(text_6, div_5);
			appendNode(div_6, div_5);
			appendNode(input, div_6);
			component.refs.search = input;

			input.value = state.search;

			appendNode(text_7, div_6);
			if (if_block_2) if_block_2.m(div_6, null);
			appendNode(text_9, div_5);
			if (if_block_3) if_block_3.m(div_5, null);
			appendNode(text_11, div_4);
			handsontable._mount(div_4, null);
			appendNode(text_12, div_4);
			appendNode(div_7, div_4);
			appendNode(button_1, div_7);
			appendNode(i_1, button_1);
			appendNode(text_13, button_1);
			appendNode(text_14, button_1);
			appendNode(text_15, button_1);
			appendNode(text_16, div_7);
			appendNode(button_2, div_7);
			appendNode(i_2, button_2);
			appendNode(text_17, button_2);
			appendNode(text_18, button_2);
			appendNode(text_19, button_2);
		},

		p: function update(changed, state) {
			if (current_block_type === (current_block_type = select_block_type(state)) && if_block) {
				if_block.p(changed, state);
			} else {
				if_block.u();
				if_block.d();
				if_block = current_block_type(state, component);
				if_block.c();
				if_block.m(div_3, null);
			}

			if (!input_updating) input.value = state.search;
			if ((changed.searchResults) && input_class_value !== (input_class_value = state.searchResults.length > 0?'with-results':'')) {
				input.className = input_class_value;
			}

			if (state.searchResults.length > 0) {
				if (!if_block_2) {
					if_block_2 = create_if_block_3(state, component);
					if_block_2.c();
					if_block_2.m(div_6, null);
				}
			} else if (if_block_2) {
				if_block_2.u();
				if_block_2.d();
				if_block_2 = null;
			}

			if (state.search) {
				if (if_block_3) {
					if_block_3.p(changed, state);
				} else {
					if_block_3 = create_if_block_4(state, component);
					if_block_3.c();
					if_block_3.m(div_5, null);
				}
			} else if (if_block_3) {
				if_block_3.u();
				if_block_3.d();
				if_block_3 = null;
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
			if (!handsontable_updating.activeColumn && changed.activeColumn) {
				handsontable_changes.activeColumn = state.activeColumn
                ;
				handsontable_updating.activeColumn = true;
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

			if ((changed.has_changes) && button_2_class_value !== (button_2_class_value = "btn " + (state.has_changes?'':'disabled'))) {
				button_2.className = button_2_class_value;
			}
		},

		u: function unmount() {
			detachNode(div);
			if_block.u();
			if (if_block_2) if_block_2.u();
			if (if_block_3) if_block_3.u();
		},

		d: function destroy$$1() {
			if_block.d();
			removeListener(button, "click", click_handler);
			removeListener(input, "input", input_input_handler);
			removeListener(input, "keypress", keypress_handler);
			if (component.refs.search === input) component.refs.search = null;
			if (if_block_2) if_block_2.d();
			if (if_block_3) if_block_3.d();
			handsontable.destroy(false);
			if (component.refs.hot === handsontable) component.refs.hot = null;
			removeListener(button_2, "click", click_handler_1);
		}
	};
}

// (5:16) {{#if customColumn}}
function create_if_block(state, component) {
	var computedcolumneditor_updating = {};

	var computedcolumneditor_initial_data = {};
	if ('customColumn' in state) {
		computedcolumneditor_initial_data.column = state.customColumn;
		computedcolumneditor_updating.column = true;
	}
	if ('formula' in state) {
		computedcolumneditor_initial_data.formula = state.formula
                    ;
		computedcolumneditor_updating.formula = true;
	}
	if ('columns' in state) {
		computedcolumneditor_initial_data.columns = state.columns
                    ;
		computedcolumneditor_updating.columns = true;
	}
	var computedcolumneditor = new ComputedColumnEditor({
		root: component.root,
		data: computedcolumneditor_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!computedcolumneditor_updating.column && changed.column) {
				newState.customColumn = childState.column;
			}

			if (!computedcolumneditor_updating.formula && changed.formula) {
				newState.formula = childState.formula;
			}

			if (!computedcolumneditor_updating.columns && changed.columns) {
				newState.columns = childState.columns;
			}
			computedcolumneditor_updating = assign({}, changed);
			component._set(newState);
			computedcolumneditor_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		var state = component.get(), childState = computedcolumneditor.get(), newState = {};
		if (!childState) return;
		if (!computedcolumneditor_updating.column) {
			newState.customColumn = childState.column;
		}

		if (!computedcolumneditor_updating.formula) {
			newState.formula = childState.formula;
		}

		if (!computedcolumneditor_updating.columns) {
			newState.columns = childState.columns;
		}
		computedcolumneditor_updating = { column: true, formula: true, columns: true };
		component._set(newState);
		computedcolumneditor_updating = {};
	});

	computedcolumneditor.on("focus", function(event) {
		component.cmFocus();
	});

	return {
		c: function create() {
			computedcolumneditor._fragment.c();
		},

		m: function mount(target, anchor) {
			computedcolumneditor._mount(target, anchor);
		},

		p: function update(changed, state) {
			var computedcolumneditor_changes = {};
			if (!computedcolumneditor_updating.column && changed.customColumn) {
				computedcolumneditor_changes.column = state.customColumn;
				computedcolumneditor_updating.column = true;
			}
			if (!computedcolumneditor_updating.formula && changed.formula) {
				computedcolumneditor_changes.formula = state.formula
                    ;
				computedcolumneditor_updating.formula = true;
			}
			if (!computedcolumneditor_updating.columns && changed.columns) {
				computedcolumneditor_changes.columns = state.columns
                    ;
				computedcolumneditor_updating.columns = true;
			}
			computedcolumneditor._set(computedcolumneditor_changes);
			computedcolumneditor_updating = {};

			
		},

		u: function unmount() {
			computedcolumneditor._unmount();
		},

		d: function destroy$$1() {
			computedcolumneditor.destroy(false);
		}
	};
}

// (13:39) 
function create_if_block_1(state, component) {
	var text, text_1_value = state.columnFormat.title(), text_1, text_2;

	return {
		c: function create() {
			text = createText("COLUMN FORMAT FOR ");
			text_1 = createText(text_1_value);
			text_2 = createText("\n\n                Hide Column\n\n                etc");
		},

		m: function mount(target, anchor) {
			insertNode(text, target, anchor);
			insertNode(text_1, target, anchor);
			insertNode(text_2, target, anchor);
		},

		p: function update(changed, state) {
			if ((changed.columnFormat) && text_1_value !== (text_1_value = state.columnFormat.title())) {
				text_1.data = text_1_value;
			}
		},

		u: function unmount() {
			detachNode(text);
			detachNode(text_1);
			detachNode(text_2);
		},

		d: noop
	};
}

// (20:16) {{else}}
function create_if_block_2(state, component) {
	var h3, text_value = "Überprüfe dass die Daten richtig aussehen", text, text_1, p, text_2_value = "Interpretiert Datawrapper deine Daten korrekt? In der nebenstehenden Tabelle sollten Zahlenspalten in blau, Datums-Spalten in grün und Textspalten in schwarz angezeigt werden.", text_2, text_3, checkbox_updating = {}, text_4, hr, text_5, div;

	var checkbox_initial_data = { label: "Erste Zeile als Beschriftung" };
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

	return {
		c: function create() {
			h3 = createElement("h3");
			text = createText(text_value);
			text_1 = createText("\n\n                ");
			p = createElement("p");
			text_2 = createText(text_2_value);
			text_3 = createText("\n\n                ");
			checkbox._fragment.c();
			text_4 = createText("\n\n                [TODO: hook]\n                ");
			hr = createElement("hr");
			text_5 = createText("\n\n                ");
			div = createElement("div");
			div.innerHTML = "<a class=\"btn submit\" href=\"upload\"><i class=\"icon-chevron-left\"></i> Zurück</a>\n                    <a href=\"visualize\" class=\"submit btn btn-primary\" id=\"describe-proceed\">Weiter <i class=\"icon-chevron-right icon-white\"></i></a>";
			this.h();
		},

		h: function hydrate() {
			h3.className = "first";
			div.className = "btn-group";
		},

		m: function mount(target, anchor) {
			insertNode(h3, target, anchor);
			appendNode(text, h3);
			insertNode(text_1, target, anchor);
			insertNode(p, target, anchor);
			appendNode(text_2, p);
			insertNode(text_3, target, anchor);
			checkbox._mount(target, anchor);
			insertNode(text_4, target, anchor);
			insertNode(hr, target, anchor);
			insertNode(text_5, target, anchor);
			insertNode(div, target, anchor);
		},

		p: function update(changed, state) {
			var checkbox_changes = {};
			checkbox_changes.label = "Erste Zeile als Beschriftung";
			if (!checkbox_updating.value && changed.firstRowIsHeader) {
				checkbox_changes.value = state.firstRowIsHeader;
				checkbox_updating.value = true;
			}
			checkbox._set(checkbox_changes);
			checkbox_updating = {};

			
		},

		u: function unmount() {
			detachNode(h3);
			detachNode(text_1);
			detachNode(p);
			detachNode(text_3);
			checkbox._unmount();
			detachNode(text_4);
			detachNode(hr);
			detachNode(text_5);
			detachNode(div);
		},

		d: function destroy$$1() {
			checkbox.destroy(false);
		}
	};
}

// (47:20) {{#if searchResults.length > 0}}
function create_if_block_3(state, component) {
	var div, button, text, button_1;

	function click_handler(event) {
		component.nextResult(-1);
	}

	function click_handler_1(event) {
		component.nextResult(+1);
	}

	return {
		c: function create() {
			div = createElement("div");
			button = createElement("button");
			button.innerHTML = "<i class=\"fa fa-chevron-up\"></i>";
			text = createText("\n                      ");
			button_1 = createElement("button");
			button_1.innerHTML = "<i class=\"fa fa-chevron-down\"></i>";
			this.h();
		},

		h: function hydrate() {
			encapsulateStyles$2(button);
			button.className = "btn";
			addListener(button, "click", click_handler);
			encapsulateStyles$2(button_1);
			button_1.className = "btn";
			addListener(button_1, "click", click_handler_1);
			div.className = "btn-group";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(button, div);
			appendNode(text, div);
			appendNode(button_1, div);
		},

		u: function unmount() {
			detachNode(div);
		},

		d: function destroy$$1() {
			removeListener(button, "click", click_handler);
			removeListener(button_1, "click", click_handler_1);
		}
	};
}

// (59:20) {{#if searchResults.length > 0}}
function create_if_block_5(state, component) {
	var text_value = state.searchIndexSafe+1, text, text_1, text_2_value = "von", text_2, text_3, text_4_value = state.searchResults.length, text_4, text_5, text_6_value = "Treffern", text_6;

	return {
		c: function create() {
			text = createText(text_value);
			text_1 = createText("\n                        ");
			text_2 = createText(text_2_value);
			text_3 = createText("\n                        ");
			text_4 = createText(text_4_value);
			text_5 = createText("\n                        ");
			text_6 = createText(text_6_value);
		},

		m: function mount(target, anchor) {
			insertNode(text, target, anchor);
			insertNode(text_1, target, anchor);
			insertNode(text_2, target, anchor);
			insertNode(text_3, target, anchor);
			insertNode(text_4, target, anchor);
			insertNode(text_5, target, anchor);
			insertNode(text_6, target, anchor);
		},

		p: function update(changed, state) {
			if ((changed.searchIndexSafe) && text_value !== (text_value = state.searchIndexSafe+1)) {
				text.data = text_value;
			}

			if ((changed.searchResults) && text_4_value !== (text_4_value = state.searchResults.length)) {
				text_4.data = text_4_value;
			}
		},

		u: function unmount() {
			detachNode(text);
			detachNode(text_1);
			detachNode(text_2);
			detachNode(text_3);
			detachNode(text_4);
			detachNode(text_5);
			detachNode(text_6);
		},

		d: noop
	};
}

// (64:37) 
function create_if_block_6(state, component) {
	var text_value = "Keine Treffer", text;

	return {
		c: function create() {
			text = createText(text_value);
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

// (57:16) {{#if search}}
function create_if_block_4(state, component) {
	var div;

	var current_block_type = select_block_type_1(state);
	var if_block = current_block_type && current_block_type(state, component);

	return {
		c: function create() {
			div = createElement("div");
			if (if_block) if_block.c();
			this.h();
		},

		h: function hydrate() {
			encapsulateStyles$2(div);
			div.className = "results";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			if (if_block) if_block.m(div, null);
		},

		p: function update(changed, state) {
			if (current_block_type === (current_block_type = select_block_type_1(state)) && if_block) {
				if_block.p(changed, state);
			} else {
				if (if_block) {
					if_block.u();
					if_block.d();
				}
				if_block = current_block_type && current_block_type(state, component);
				if (if_block) if_block.c();
				if (if_block) if_block.m(div, null);
			}
		},

		u: function unmount() {
			detachNode(div);
			if (if_block) if_block.u();
		},

		d: function destroy$$1() {
			if (if_block) if_block.d();
		}
	};
}

function select_block_type(state) {
	if (state.customColumn) return create_if_block;
	if (state.columnFormat) return create_if_block_1;
	return create_if_block_2;
}

function select_block_type_1(state) {
	if (state.searchResults.length > 0) return create_if_block_5;
	if (state.search) return create_if_block_6;
	return null;
}

function App(options) {
	this._debugName = '<App>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this.refs = {};
	this._state = assign(data$2(), options.data);
	this._recompute({ searchIndex: 1, searchResults: 1, activeColumn: 1 }, this._state);
	if (!('searchIndex' in this._state)) console.warn("<App> was created without expected data property 'searchIndex'");
	if (!('searchResults' in this._state)) console.warn("<App> was created without expected data property 'searchResults'");
	if (!('activeColumn' in this._state)) console.warn("<App> was created without expected data property 'activeColumn'");
	if (!('customColumn' in this._state)) console.warn("<App> was created without expected data property 'customColumn'");
	if (!('formula' in this._state)) console.warn("<App> was created without expected data property 'formula'");
	if (!('columns' in this._state)) console.warn("<App> was created without expected data property 'columns'");
	if (!('columnFormat' in this._state)) console.warn("<App> was created without expected data property 'columnFormat'");
	if (!('firstRowIsHeader' in this._state)) console.warn("<App> was created without expected data property 'firstRowIsHeader'");
	if (!('search' in this._state)) console.warn("<App> was created without expected data property 'search'");
	if (!('searchIndexSafe' in this._state)) console.warn("<App> was created without expected data property 'searchIndexSafe'");
	if (!('chartData' in this._state)) console.warn("<App> was created without expected data property 'chartData'");
	if (!('transpose' in this._state)) console.warn("<App> was created without expected data property 'transpose'");
	if (!('has_changes' in this._state)) console.warn("<App> was created without expected data property 'has_changes'");

	var _oncreate = oncreate$2.bind(this);

	if (!options.root) {
		this._oncreate = [_oncreate];
		this._beforecreate = [];
		this._aftercreate = [];
	} else {
	 	this.root._oncreate.push(_oncreate);
	 }

	this._fragment = create_main_fragment$3(this._state, this);

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

assign(App.prototype, methods$2, protoDev);

App.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('searchIndexSafe' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'searchIndexSafe'");
	if ('customColumn' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'customColumn'");
	if ('columnFormat' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'columnFormat'");
	if ('columns' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'columns'");
};

App.prototype._recompute = function _recompute(changed, state) {
	if (changed.searchIndex || changed.searchResults) {
		if (differs(state.searchIndexSafe, (state.searchIndexSafe = searchIndexSafe(state.searchIndex, state.searchResults)))) changed.searchIndexSafe = true;
	}

	if (changed.activeColumn) {
		if (differs(state.customColumn, (state.customColumn = customColumn(state.activeColumn)))) changed.customColumn = true;
		if (differs(state.columnFormat, (state.columnFormat = columnFormat(state.activeColumn)))) changed.columnFormat = true;
		if (differs(state.columns, (state.columns = columns(state.activeColumn)))) changed.columns = true;
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

const data$3 = {
    chart: {
        id: ''
    },
    readonly: false,
    chartData: '',
    transpose: false,
    firstRowIsHeader: true,
    skipRows: 0
};

var main = { App, store, data: data$3 };

return main;

})));
