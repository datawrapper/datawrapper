(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('Handsontable'), require('cm/lib/codemirror'), require('cm/mode/javascript/javascript'), require('cm/addon/mode/simple'), require('cm/addon/hint/show-hint'), require('cm/addon/edit/matchbrackets'), require('cm/addon/display/placeholder')) :
	typeof define === 'function' && define.amd ? define('svelte/describe', ['Handsontable', 'cm/lib/codemirror', 'cm/mode/javascript/javascript', 'cm/addon/mode/simple', 'cm/addon/hint/show-hint', 'cm/addon/edit/matchbrackets', 'cm/addon/display/placeholder'], factory) :
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

function detachBefore(after) {
	while (after.previousSibling) {
		after.parentNode.removeChild(after.previousSibling);
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
	get: get,
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

/* describe/Handsontable.html generated by Svelte v1.57.3 */

let app = null;

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
        sortBy: '-',
        transpose: false,
        activeColumn: null,
        search: '',
        searchResults: []
    };
}
var methods = {
    render() {
        this.get('hot').render();
    },
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

        const cellRenderer = getCellRenderer(this, ds, HOT, {});

        hot.updateSettings({
            cells: (row, col) => {
                const {readonly} = this.get();
                return {
                    readOnly: readonly || (ds.hasColumn(col) && ds.column(col).isComputed && row === 0),
                    renderer: cellRenderer
                };
            },
            manualColumnMove: []
        });

        this.set({ds});
        this.set({has_changes: chart.get('metadata.data.changes', []).length > 0});

        HOT.hooks.once('afterRender', () => this.initCustomEvents());
        hot.render();
    },
    dataChanged (cells) {
        const {hot} = this.get();
        let changed = false;
        cells.forEach(([row, col, old_val, new_val]) => {
            if (old_val != new_val) {
                const chart = this.store.get('dw_chart');
                const {transpose} = this.get();
                const changes = chart.get('metadata.data.changes', []);
                row = hot.toPhysicalRow(row);
                if (transpose) {
                    // swap row and col
                    const tmp = row;
                    row = col;
                    col = tmp;
                }
                // store new change
                changes.push({
                    column: col, row, value: new_val, time: (new Date()).getTime()
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
        const insertAt = after ? newOrder.indexOf(after) : 0;
        newOrder.splice(insertAt, 0, ...elements);
        this.store.get('dw_chart')
            .set('metadata.data.column-order', newOrder.slice(0));
        this.set({columnOrder: newOrder});
        // update selection
        HOT.hooks.once('afterRender', () => {
            setTimeout(() => {
                this.fire('resetSort');
                hot.selectCell(0, insertAt, hot.countRows()-1,
                    insertAt+elements.length-1);
            }, 10);
        });
        this.update();
    },
    updateHeight () {
        const h = document.querySelector('.ht_master.handsontable .wtHolder .wtHider').getBoundingClientRect().height;
        this.refs.hot.style.height = Math.min(500, h+10)+'px';
    },
    checkRange (r,c,r2,c2) {
        // check if
        // 1. only a single column is selected, and
        // 2. the range starts at the first row, and
        // 3. the range extends through he last row
        const {hot} = this.get();
        const {ds} = this.get();
        const refs = this.refs;
        if (c == c2 && r === 0 && r2 == hot.countRows()-1) {
            // const chart = this.store.get('dw_chart');
            // this.set({activeColumn: chart.dataset().column(c)});
            return;
        }
        if (c != c2 && r === 0 && r2 == hot.countRows()-1) {
            const sel = [];
            for (let i=Math.min(c,c2); i<=Math.max(c,c2); i ++) {
                sel.push(+document.querySelector(`#data-preview .htCore tbody tr:first-child td:nth-child(${i+2})`).dataset.column);
            }
            this.set({multiSelection:  sel.map(i => ds.column(i)), activeColumn:null});
            return;
        }
        this.set({activeColumn:null, multiSelection:false});
    },
    initCustomEvents () {
        // wait a bit to make sure HoT is rendered
        setTimeout(() => {
            // catch click events on A,B,C,D... header row
            this.refs.hot.querySelectorAll('.htCore thead th+th').forEach(th => {
                th.removeEventListener('click', cellHeaderClick);
                th.addEventListener('click', cellHeaderClick);
            });
        }, 500);
    },

    getColumnFormat(name) {
        const chart = this.store.get('dw_chart');
        const colFormats = chart.get('metadata.data.column-format', {});
        return colFormats[name] || { type: 'auto', ignore: false };
    }
};

function oncreate() {
    app = this;
    HOT.hooks.once('afterRender', () => this.initCustomEvents());

    window.addEventListener('keypress', (evt) => {
        const {activeColumn, ds} = this.get();
        if (!activeColumn) return;
        if (evt.key == 'ArrowRight' || evt.key == 'ArrowLeft') {
            evt.preventDefault();
            evt.stopPropagation();
            const cur_i = ds.indexOf(activeColumn.name());
            if (evt.key == 'ArrowRight') {
                // select next column
                this.set({activeColumn: ds.column((cur_i+1) % ds.numColumns())});
            } else {
                // select prev column
                this.set({activeColumn: ds.column((cur_i-1+ds.numColumns()) % ds.numColumns())});
            }
        }

    });

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
        height: 500,
        manualColumnMove: true,
        selectionMode: 'range',
        autoColumnSize: {useHeaders: true, syncLimit: 5},
        // comments: true,
        // contextMenu: true,

        // sorting
        columnSorting: true,
        sortIndicator: true,
        sortFunction: function(sortOrder, columnMeta) {
            if (columnMeta.col > -1) {
                var column = chart.dataset().column(columnMeta.col);
                var colType = column.type();
                var plugin = hot.getPlugin('columnSorting');
                return function(a, b) {
                    var sortFunction;
                    if (a[0] === 0) return -1;
                    // replace with values
                    a[1] = column.val(a[0]-1);
                    b[1] = column.val(b[0]-1);
                    if (colType == 'number') {
                        // sort NaNs at bottom
                        if (isNaN(a[1])) a[1] = !sortOrder ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
                        if (isNaN(b[1])) b[1] = !sortOrder ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
                    }
                    if (colType == 'date') {
                        if (typeof a[1] == 'string') a[1] = new Date(110,0,1);
                        if (typeof b[1] == 'string') b[1] = new Date(110,0,1);
                    }
                    switch (colType) {
                        case 'date':
                            sortFunction = plugin.dateSort;
                            break;
                        case 'number':
                            sortFunction = plugin.numericSort;
                            break;
                        default:
                            sortFunction = plugin.defaultSort;
                    }
                    return sortFunction(sortOrder, columnMeta)(a, b);
                };
            }
            return (a,b) => a[0]-b[0];
        },
        afterGetColHeader: (col, th) => {
            const {activeColumn, ds} = this.get();
            if (!ds || !ds.hasColumn(col)) return;
            if ((col === 0 || col) && activeColumn && ds.column(col).name() == activeColumn.name()) {
                th.classList.add('selected');
            }

            if (col === 0 || col) {
                if (this.getColumnFormat(ds.column(col).name()).ignore) {
                    th.classList.add('ignored');
                } else {
                    th.classList.remove('ignored');
                }
            }
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

    this.observe('data', () => this.update());
    this.observe('firstRowIsHeader', (v, vo) => {
        if (v != vo && vo !== undefined) this.update();
    });

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

    this.observe('activeColumn', () => {
        setTimeout(() => hot.render(), 10);
    });

    // if (hot.sortingEnabled) {
    this.observe('sorting', (sorting) => {
        hot.sort(chart.dataset().indexOf(sorting.sortBy), sorting.sortDir);
    });
    // }

}
function getCellRenderer(app, dataset, Handsontable) {
    const colTypeIcons = {
        date: 'fa fa-clock-o'
    };
    function HtmlCellRender(instance, TD, row, col, prop, value, cellProperties) {
        var escaped = dw.utils.purifyHtml(Handsontable.helper.stringify(value));
        TD.innerHTML = escaped; // this is faster than innerHTML. See: https://github.com/warpech/jquery-handsontable/wiki/JavaScript-&-DOM-performance-tips
    }
    return function(instance, td, row, col, prop, value, cellProperties) {
        if (dataset.numColumns() <= col || !dataset.hasColumn(col)) return;
        const column = dataset.column(col);
        const {searchResults, currentResult, activeColumn} = app.get();
        const colFormat = app.getColumnFormat(column.name());
        row = instance.toPhysicalRow(row);
        if (row > 0) {
            var formatter = chart.columnFormatter(column);
            value = formatter(column.val(row - 1), true);
        }
        if (parseInt(value) < 0) { // if row contains negative number
            td.classList.add('negative');
        }
        td.classList.add(column.type()+'Type');
        td.dataset.column = col;

        if (column.type() == 'text' && value && value.length > 70) {
            value = value.substr(0,60)+'…';
        }

        if (row === 0) {
            td.classList.add('firstRow');
            if (colTypeIcons[column.type()]) {
                value = '<i class="'+colTypeIcons[column.type()]+'"></i> ' + value;
            }
        } else {
            td.classList.add(row % 2 ? 'oddRow' : 'evenRow');
        }
        if (colFormat.ignore) {
            td.classList.add('ignored');
        }
        if (activeColumn && activeColumn.name() == column.name()) {
            td.classList.add('active');
        }
        const row_p = instance.getPlugin('columnSorting').untranslateRow(row);
        searchResults.forEach(res => {
            if (res.row == row_p && res.col == col) {
                td.classList.add('htSearchResult');
            }
        });
        if (currentResult && currentResult.row == row_p && currentResult.col == col) {
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

function cellHeaderClick(evt) {
    const th = this;
    // reset the HoT selection
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
    const col_i = +app.refs.hot.querySelector(`.htCore tbody tr:first-child td:nth-child(${th_i+1})`).dataset.column;
    const chart = app.store.get('dw_chart');
    const {activeColumn,hot} = app.get();
    if (chart.dataset().hasColumn(col_i)) {
        const newActive = chart.dataset().column(+col_i);
        // set active column (or unset if it's already set)
        if (activeColumn && activeColumn.name() == newActive.name()) {
            evt.target.parentNode.classList.remove('selected');
            app.set({activeColumn:false});
            hot.deselectCell();
        } else {
            evt.target.parentNode.classList.add('selected');
            app.set({activeColumn: newActive});
        }
    }
}

function create_main_fragment(component, state) {
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
		this._oncreate = [];
	}

	this._fragment = create_main_fragment(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._oncreate);
	}
}

assign(Handsontable_1.prototype, methods, protoDev);

Handsontable_1.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('currentResult' in newState && !this._updatingReadonlyProperty) throw new Error("<Handsontable_1>: Cannot set read-only property 'currentResult'");
};

Handsontable_1.prototype._recompute = function _recompute(changed, state) {
	if (changed.searchResults || changed.searchIndex) {
		if (this._differs(state.currentResult, (state.currentResult = currentResult(state.searchResults, state.searchIndex)))) changed.currentResult = true;
	}
};

// `_isObject` : an object's function
// -----------------------------------

// Is a given variable an object?
function _isObject (obj) {
	var type = typeof obj;
	return type === 'function' || type === 'object' && !!obj;
}

// quick reference variables for speed access
//-------------------------------------------

// Save bytes in the minified (but not gzipped) version:
const ArrayProto = Array.prototype;
const ObjProto = Object.prototype;
const slice = ArrayProto.slice;
const toString = ObjProto.toString;
const hasOwnProperty = ObjProto.hasOwnProperty;

// All **ECMAScript 5** native function implementations that we hope to use
// are declared here.
const nativeIsArray = Array.isArray;
const nativeKeys = Object.keys;

// `_has` : an object's function

// Shortcut function for checking if an object has a given property directly
// on itself (in other words, not on a prototype).
function _has (obj, key) {
	return obj != null && hasOwnProperty.call(obj, key);
}

// `_keys` : an object's function

// Retrieve the names of an object's own properties.
// Delegates to **ECMAScript 5**'s native `Object.keys`.
function _keys (obj) {
	if (!_isObject(obj)) return [];
	if (nativeKeys) return nativeKeys(obj);
	let keys = [];
	for (let key in obj)
		if (_has(obj, key)) keys.push(key);
		// Ahem, IE < 9.
	if (hasEnumBug) collectNonEnumProps(obj, keys);
	return keys;
}

// `_forEach` : a collection's function

// `_each` : a collection's function

// `_findIndex` : an array's function

// Returns the first index on an array-like that passes a predicate test.
var _findIndex = createPredicateIndexFinder(1);

// `_sortedIndex` : an array's function

// Use a comparator function to figure out the smallest index at which
// an object should be inserted so as to maintain order. Uses binary search.
function _sortedIndex (array, obj, iteratee, context) {
	iteratee = cb(iteratee, context, 1);
	let value = iteratee(obj);
	let low = 0,
		high = getLength(array);
	while (low < high) {
		let mid = Math.floor((low + high) / 2);
		if (iteratee(array[mid]) < value) low = mid + 1;
		else high = mid;
	}
	return low;
}

// `_indexOf` : an array's function

// Return the position of the first occurrence of an item in an array,
// or -1 if the item is not included in the array.
// If the array is large and already in sort order, pass `true`
// for **isSorted** to use binary search.
var _indexOf = createIndexFinder(1, _findIndex, _sortedIndex);

// `_values` : an object's function

// Retrieve the values of an object's properties.
function _values (obj) {
	let keys = _keys(obj);
	let length = keys.length;
	let values = Array(length);
	for (let i = 0; i < length; i++) {
		values[i] = obj[keys[i]];
	}
	return values;
}

// `_include` : a collection's function

// Determine if the array or object contains a given item (using `===`).
function _contains (obj, item, fromIndex, guard) {
	if (!isArrayLike(obj)) obj = _values(obj);
	if (typeof fromIndex != 'number' || guard) fromIndex = 0;
	return _indexOf(obj, item, fromIndex) >= 0;
}

// `_contains` : a collection's function

// `_isArray` : an object's function

// Is a given value an array?
// Delegates to ECMA5's native Array.isArray
var _isArray = nativeIsArray || function (obj) {
	return toString.call(obj) === '[object Array]';
};

// `_isFunction` : an object's function

// Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
// IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
function customFunction() {
	if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof document !== 'undefined' && typeof document.childNodes != 'function') {
		return (obj) => typeof obj == 'function' || false;
	}
	return null;
}

// Is a given value a function?
var _isFunction = customFunction() || function (obj) {
	return toString.call(obj) === '[object Function]';
};

// `_isArguments` : an object's function

// Define a fallback version of the method in browsers (ahem, IE < 9), where
// there isn't any inspectable "Arguments" type.
function customArguments () {
	if (toString.call(arguments) === '[object Arguments]') return null;
	return (obj) => _has(obj, 'callee');
}

// Is a given value an arguments object?
var _isArguments = customArguments() || function (obj) {
	return toString.call(obj) === '[object Arguments]';
};

// `_isNumber` : an object's function

// Is a given value a number?
function _isNumber (obj) {
	return toString.call(obj) === '[object Number]';
}

// `_isNaN` : an object's function

// Is the given value `NaN`?
function _isNaN (obj) {
	return _isNumber(obj) && isNaN(obj);
}

// `_invert` : an object's function

// Invert the keys and values of an object. The values must be serializable.
function _invert (obj) {
	let result = {};
	let keys = _keys(obj);
	for (let i = 0, length = keys.length; i < length; i++) {
		result[obj[keys[i]]] = keys[i];
	}
	return result;
}

// `_iteratee` : an utility's function

// External wrapper for our callback generator. Users may customize
// `_.iteratee` if they want additional predicate/iteratee shorthand styles.
// This abstraction hides the internal-only argCount argument.
var _iteratee = builtinIteratee;

// `_identity` : an utility's function
// ------------------------------------

// Keep the identity function around for default iteratees.
function _identity (value) {
	return value;
}

// `_extendOwn` : an object's function

// Extend a given object with the properties in passed-in object(s).
var _extendOwn = createAssigner(_keys);

// `_isMatch` : an object's function

// Returns whether an object has a given set of `key:value` pairs.
function _isMatch (object, attrs) {
	let keys = _keys(attrs),
		length = keys.length;
	if (object == null) return !length;
	let obj = Object(object);
	for (let i = 0; i < length; i++) {
		let key = keys[i];
		if (attrs[key] !== obj[key] || !(key in obj)) return false;
	}
	return true;
}

// `_matches` : an utility's function

// Returns a predicate for checking whether an object has a given set of
// `key:value` pairs.
function _matcher (attrs) {
	attrs = _extendOwn({}, attrs);
	return (obj) => _isMatch(obj, attrs);
}

// `_matcher` : an utility's function

// `_` : base namespace and constructor for underscore's object
 // @important: exportation of the function, not only it definition

// Internal functions


// Internal function that returns an efficient (for current engines) version
// of the passed-in callback, to be repeatedly applied in other Underscore
// functions.
function optimizeCb (func, context, argCount) {
	if (context === void 0) return func;
	switch (argCount == null ? 3 : argCount) {
		case 1: return (value) => func.call(context, value);
			// The 2-parameter case has been omitted only because no current consumers
			// made use of it.
		case 3: return (value, index, collection) =>  func.call(context, value, index, collection);
		case 4: return (accumulator, value, index, collection) => func.call(context, accumulator, value, index, collection);
	}
	return function () {
		return func.apply(context, arguments);
	};
}

// for callback generator.
// This abstraction is use to hide the internal-only argCount argument.
function builtinIteratee (value, context) {
	return cb(value, context, Infinity);
}

// An internal function to generate callbacks that can be applied to each
// element in a collection, returning the desired result — either `identity`,
// an arbitrary callback, a property matcher, or a property accessor.
function cb (value, context, argCount) {
	if (_iteratee !== builtinIteratee) return _iteratee(value, context);
	if (value == null) return _identity;
	if (_isFunction(value)) return optimizeCb(value, context, argCount);
	if (_isObject(value)) return _matcher(value);
	return property(value);
}

// Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
// This accumulates the arguments passed into an array, after a given index.
function restArgs (func, startIndex) {
	startIndex = startIndex == null ? func.length - 1 : +startIndex;
	return function () {
		let length = Math.max(arguments.length - startIndex, 0),
			rest = Array(length),
			index = 0;
		for (; index < length; index++) {
			rest[index] = arguments[index + startIndex];
		}
		switch (startIndex) {
			case 0:
				return func.call(this, rest);
			case 1:
				return func.call(this, arguments[0], rest);
			case 2:
				return func.call(this, arguments[0], arguments[1], rest);
		}
		var args = Array(startIndex + 1);
		for (index = 0; index < startIndex; index++) {
			args[index] = arguments[index];
		}
		args[startIndex] = rest;
		return func.apply(this, args);
	};
}

// An internal function used for get key's value from an object.
function property (key) {
	return (obj) => obj == null ? void 0 : obj[key];
}

// Helper for collection methods to determine whether a collection
// should be iterated as an array or as an object.
// Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
// Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
const MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
var getLength = property('length');
var isArrayLike = function(collection) { // @TODO simplify to function
	let length = getLength(collection);
	return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
};

// Generator function to create the findIndex and findLastIndex functions.
function createPredicateIndexFinder (dir) {
	return function (array, predicate, context) {
		predicate = cb(predicate, context);
		let length = getLength(array);
		let index = dir > 0 ? 0 : length - 1;
		for (; index >= 0 && index < length; index += dir) {
			if (predicate(array[index], index, array)) return index;
		}
		return -1;
	};
}

// Generator function to create the indexOf and lastIndexOf functions.
function createIndexFinder (dir, predicateFind, sortedIndex) {
	return function (array, item, idx) {
		let i = 0,
			length = getLength(array);
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
			idx = predicateFind(slice.call(array, i, length), _isNaN);
			return idx >= 0 ? idx + i : -1;
		}
		for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
			if (array[idx] === item) return idx;
		}
		return -1;
	};
}

// Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
// @TODO move to _quickaccess to prevent inappropriate cyclic dependency with `keys` and `allkeys`
// @FUTURE remove this hack when the will ignore IE<9 since the goal is now ES6 and beyond.
var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];
// hack for enumerating bug
function collectNonEnumProps (obj, keys) {
	let nonEnumIdx = nonEnumerableProps.length;
	let constructor = obj.constructor;
	let proto = _isFunction(constructor) && constructor.prototype || ObjProto;

	// Constructor is a special case.
	let prop = 'constructor';
	if (_has(obj, prop) && !_contains(keys, prop)) keys.push(prop);

	while (nonEnumIdx--) {
		prop = nonEnumerableProps[nonEnumIdx];
		if (prop in obj && obj[prop] !== proto[prop] && !_contains(keys, prop)) {
			keys.push(prop);
		}
	}
}

// An internal function for creating assigner functions.
function createAssigner (keysFunc, defaults) {
	return function (obj) {
		let length = arguments.length;
		if (defaults) obj = Object(obj);
		if (length < 2 || obj == null) return obj;
		for (let index = 1; index < length; index++) {
			let source = arguments[index],
				keys = keysFunc(source),
				l = keys.length;
			for (let i = 0; i < l; i++) {
				let key = keys[i];
				if (_isObject(obj) && (!defaults || obj[key] === void 0)) obj[key] = source[key];
			}
		}
		return obj;
	};
}

// List of HTML entities for escaping.
var escapeMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#x27;',
	'`': '&#x60;'
};
var unescapeMap = _invert(escapeMap);

// `_delay` : (ahem) a function's function

// Delays a function for the given number of milliseconds, and then calls
// it with the arguments supplied.
var _delay = restArgs( (func, wait, args) => {
  return setTimeout( () => {
    return func.apply(null, args);
  }, wait);
});

// `_debounce` : (ahem) a function's function

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function _debounce (func, wait, immediate) {
  let timeout, result;

  let later = function (context, args) {
    timeout = null;
    if (args) result = func.apply(context, args);
  };

  let debounced = restArgs(function (args) {
    if (timeout) clearTimeout(timeout);
    if (immediate) {
      var callNow = !timeout;
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(this, args);
    } else {
      timeout = _delay(later, wait, this, args);
    }

    return result;
  });

  debounced.cancel = function () {
    clearTimeout(timeout);
    timeout = null;
  };

  return debounced;
}

function clone(o) {
	if (!o || typeof o != 'object') return o;
	try {
		return JSON.parse(JSON.stringify(o));
	} catch(e) {
		return o;
	}
}

/* describe/ComputedColumnEditor.html generated by Svelte v1.57.3 */

function title(column) {
    var s = "Edit column %s";
    return s.replace('%s', `"${column ? column.title() || column.name() : '--'}"`)
}
function metaColumns(columns) {
    if (!columns) return [];
    return columns.map(col => {
        return {
            key: column_name_to_var(col.name()),
            title: col.title(),
            type: col.type()
        };
    });
}
function keywords(metaColumns) {
    const keywords = ['sum','round','min','max','median','mean'];
    metaColumns.forEach(function(col) {
        keywords.push(col.key);
        if (col.type == 'number') {
            keywords.push(col.key+'__sum');
            keywords.push(col.key+'__min');
            keywords.push(col.key+'__max');
            keywords.push(col.key+'__mean');
            keywords.push(col.key+'__median');
        }
    });
    return keywords;
}
function data$1() {
    return {
        name: '',
        formula: ''
    }
}
var methods$1 = {
    insert (column) {
        const {cm} = this.get();
        cm.replaceSelection(column.key);
        cm.focus();
    },
    removeColumn() {
        const {column} = this.get();
        const chart = this.store.get('dw_chart');
        const ds = chart.dataset();
        const customCols = clone(chart.get('metadata.describe.computed-columns', {}));
        delete customCols[column.name()];
        const col_index = ds.columnOrder()[ds.indexOf(column.name())];
        // delete all changes that have been made to this column
        const changes = chart.get('metadata.data.changes', []);
        const changes_new = [];
        changes.forEach(c => {
            if (c.column == col_index) return; // skip
            if (c.column > col_index) c.column--;
            changes_new.push(c);
        });
        chart.set('metadata.describe.computed-columns', customCols);
        chart.set('metadata.data.changes', changes_new);
        chart.saveSoon();
        this.fire('updateTable');
        this.fire('unselect');
    }
};

function oncreate$1() {
    const {column} = this.get();

    const chart = this.store.get('dw_chart');
    const customCols = chart.get('metadata.describe.computed-columns', {});

    this.set({
        formula: customCols[column.name()] || '',
        name: column.title()
    });

    // update if column changes
    this.observe('column', (col) => {
        if (col) this.set({
            formula: customCols[col.name()] || '',
            name: col.title()
        });
    });

    const app = this;

    function scriptHint(editor) {
        // Find the token at the cursor
        var cur = editor.getCursor(),
            token = editor.getTokenAt(cur),
            match = [];

        const keywords = app.get('keywords');

        if (token.type == 'variable') {
            match = keywords.filter(function(chk) {
                return chk.toLowerCase()
                    .indexOf(token.string.toLowerCase()) === 0;
            });
        }

        return {
            list: match,
            from: CodeMirror.Pos(cur.line, token.start),
            to: CodeMirror.Pos(cur.line, token.end)
        };
    }

    // CodeMirror.registerHelper("hint", "javascript", function(editor, options) {
    //     return scriptHint(editor, options);
    // });

    const cm = CodeMirror.fromTextArea(this.refs.code, {
        value: this.get('formula') || '',
        mode: 'simple',
        indentUnit: 2,
        tabSize: 2,
        lineWrapping: true,
        matchBrackets: true,
        placeholder: '// enter formula here',
        continueComments: "Enter",
        extraKeys: {
            'Tab': 'autocomplete'
        },
        hintOptions: {
            hint: scriptHint
        }
    });

    window.CodeMirror = CodeMirror;

    this.set({cm});

    const updateTable = _debounce(() => this.fire('updateTable'), 1500);

    this.observe('formula', (formula) => {
        // update codemirror
        if (formula != cm.getValue()) {
            cm.setValue(formula);
        }
        // update dw.chart
        const {column} = this.get();
        const customCols = chart.get('metadata.describe.computed-columns', {});
        if (customCols[column.name()] != formula) {
            customCols[column.name()] = formula;
            chart.set('metadata.describe.computed-columns', customCols);
            if (chart.saveSoon) chart.saveSoon();
            updateTable();
        }
    });

    this.observe('name', (name) => {
        const {column} = this.get();
        const changes = chart.get('metadata.data.changes', []);
        const ds = chart.dataset();
        const col = ds.columnOrder()[ds.indexOf(column.name())];
        let last_col_name_change_i = -1;
        changes.forEach((change,i) => {
            if (change.column == col && change.row === 0) {
                last_col_name_change_i = i;
            }
        });
        if (last_col_name_change_i > -1) {
            // update last change of that cell
            changes[last_col_name_change_i].value = name;
            changes[last_col_name_change_i].time = (new Date()).getTime();
        } else {
            // add new change
            changes.push({
                column: col, row: 0, value: name, time: (new Date()).getTime()
            });
        }
        chart.set('metadata.data.changes', changes);
        if (chart.saveSoon) chart.saveSoon();
        updateTable();
    });

    cm.on('change', (cm) => {
        this.set({formula: cm.getValue()});
    });

    this.observe('metaColumns', (cols) => {
        var columns_regex = new RegExp(`(?:${this.get('keywords').join('|')})`);
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
        .replace(/^(abstract|arguments|await|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|window|with|yield)$/, '$1_'); // reserved keywords
}

function create_main_fragment$1(component, state) {
	var div, h3, text, text_1, p, text_2_value = "The values for columns can be calculated using a formula, similar to Excel.", text_2, text_3, label, text_4_value = "Column name", text_4, text_5, input, input_updating = false, text_6, label_1, text_7_value = "Formula (JavaScript)", text_7, text_8, textarea, text_9, p_1, text_10_value = "Available columns (click to add them to the formula)", text_10, text_11, text_12, ul, text_14, button, i, text_15, text_16_value = "Remove this column", text_16;

	function input_input_handler() {
		input_updating = true;
		component.set({ name: input.value });
		input_updating = false;
	}

	var metaColumns = state.metaColumns;

	var each_blocks = [];

	for (var i_1 = 0; i_1 < metaColumns.length; i_1 += 1) {
		each_blocks[i_1] = create_each_block(component, assign({}, state, {
			metaColumns: metaColumns,
			col: metaColumns[i_1],
			col_index: i_1
		}));
	}

	function click_handler_1(event) {
		component.removeColumn();
	}

	return {
		c: function create() {
			div = createElement("div");
			h3 = createElement("h3");
			text = createText(state.title);
			text_1 = createText("\n    ");
			p = createElement("p");
			text_2 = createText(text_2_value);
			text_3 = createText("\n\n    ");
			label = createElement("label");
			text_4 = createText(text_4_value);
			text_5 = createText("\n    ");
			input = createElement("input");
			text_6 = createText("\n\n    ");
			label_1 = createElement("label");
			text_7 = createText(text_7_value);
			text_8 = createText("\n    ");
			textarea = createElement("textarea");
			text_9 = createText("\n\n    ");
			p_1 = createElement("p");
			text_10 = createText(text_10_value);
			text_11 = createText(":");
			text_12 = createText("\n\n    ");
			ul = createElement("ul");

			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
				each_blocks[i_1].c();
			}

			text_14 = createText("\n\n");
			button = createElement("button");
			i = createElement("i");
			text_15 = createText(" ");
			text_16 = createText(text_16_value);
			this.h();
		},

		h: function hydrate() {
			h3.className = "first";
			label.className = "svelte-du6ec3";
			addListener(input, "input", input_input_handler);
			input.type = "text";
			label_1.className = "svelte-du6ec3";
			textarea.className = "code";
			setStyle(p_1, "margin-top", "1em");
			ul.className = "col-select svelte-du6ec3";
			setStyle(div, "margin-bottom", "15px");
			i.className = "fa fa-trash";
			button.className = "btn btn-danger";
			addListener(button, "click", click_handler_1);
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(h3, div);
			appendNode(text, h3);
			appendNode(text_1, div);
			appendNode(p, div);
			appendNode(text_2, p);
			appendNode(text_3, div);
			appendNode(label, div);
			appendNode(text_4, label);
			appendNode(text_5, div);
			appendNode(input, div);

			input.value = state.name;

			appendNode(text_6, div);
			appendNode(label_1, div);
			appendNode(text_7, label_1);
			appendNode(text_8, div);
			appendNode(textarea, div);
			component.refs.code = textarea;
			appendNode(text_9, div);
			appendNode(p_1, div);
			appendNode(text_10, p_1);
			appendNode(text_11, p_1);
			appendNode(text_12, div);
			appendNode(ul, div);

			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
				each_blocks[i_1].m(ul, null);
			}

			insertNode(text_14, target, anchor);
			insertNode(button, target, anchor);
			appendNode(i, button);
			appendNode(text_15, button);
			appendNode(text_16, button);
		},

		p: function update(changed, state) {
			if (changed.title) {
				text.data = state.title;
			}

			if (!input_updating) input.value = state.name;

			var metaColumns = state.metaColumns;

			if (changed.metaColumns) {
				for (var i_1 = 0; i_1 < metaColumns.length; i_1 += 1) {
					var each_context = assign({}, state, {
						metaColumns: metaColumns,
						col: metaColumns[i_1],
						col_index: i_1
					});

					if (each_blocks[i_1]) {
						each_blocks[i_1].p(changed, each_context);
					} else {
						each_blocks[i_1] = create_each_block(component, each_context);
						each_blocks[i_1].c();
						each_blocks[i_1].m(ul, null);
					}
				}

				for (; i_1 < each_blocks.length; i_1 += 1) {
					each_blocks[i_1].u();
					each_blocks[i_1].d();
				}
				each_blocks.length = metaColumns.length;
			}
		},

		u: function unmount() {
			detachNode(div);

			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
				each_blocks[i_1].u();
			}

			detachNode(text_14);
			detachNode(button);
		},

		d: function destroy$$1() {
			removeListener(input, "input", input_input_handler);
			if (component.refs.code === textarea) component.refs.code = null;

			destroyEach(each_blocks);

			removeListener(button, "click", click_handler_1);
		}
	};
}

// (14:8) {{#each metaColumns as col}}
function create_each_block(component, state) {
	var col = state.col, col_index = state.col_index;
	var li, text_value = col.key, text;

	return {
		c: function create() {
			li = createElement("li");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			li.className = "svelte-du6ec3";
			addListener(li, "click", click_handler);

			li._svelte = {
				component: component,
				metaColumns: state.metaColumns,
				col_index: state.col_index
			};
		},

		m: function mount(target, anchor) {
			insertNode(li, target, anchor);
			appendNode(text, li);
		},

		p: function update(changed, state) {
			col = state.col;
			col_index = state.col_index;
			if ((changed.metaColumns) && text_value !== (text_value = col.key)) {
				text.data = text_value;
			}

			li._svelte.metaColumns = state.metaColumns;
			li._svelte.col_index = state.col_index;
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
	var metaColumns = this._svelte.metaColumns, col_index = this._svelte.col_index, col = metaColumns[col_index];
	component.insert(col);
}

function ComputedColumnEditor(options) {
	this._debugName = '<ComputedColumnEditor>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this.refs = {};
	this._state = assign(data$1(), options.data);
	this._recompute({ column: 1, columns: 1, metaColumns: 1 }, this._state);
	if (!('column' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'column'");
	if (!('columns' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'columns'");
	if (!('metaColumns' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'metaColumns'");
	if (!('title' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'title'");
	if (!('name' in this._state)) console.warn("<ComputedColumnEditor> was created without expected data property 'name'");

	var _oncreate = oncreate$1.bind(this);

	if (!options.root) {
		this._oncreate = [];
	}

	this._fragment = create_main_fragment$1(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._oncreate);
	}
}

assign(ComputedColumnEditor.prototype, methods$1, protoDev);

ComputedColumnEditor.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('title' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'title'");
	if ('metaColumns' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'metaColumns'");
	if ('keywords' in newState && !this._updatingReadonlyProperty) throw new Error("<ComputedColumnEditor>: Cannot set read-only property 'keywords'");
};

ComputedColumnEditor.prototype._recompute = function _recompute(changed, state) {
	if (changed.column) {
		if (this._differs(state.title, (state.title = title(state.column)))) changed.title = true;
	}

	if (changed.columns) {
		if (this._differs(state.metaColumns, (state.metaColumns = metaColumns(state.columns)))) changed.metaColumns = true;
	}

	if (changed.metaColumns) {
		if (this._differs(state.keywords, (state.keywords = keywords(state.metaColumns)))) changed.keywords = true;
	}
};

/* controls/Checkbox.html generated by Svelte v1.57.3 */

function data$2() {
    return {
        disabled: false
    }
}
function create_main_fragment$2(component, state) {
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
			addListener(input, "change", input_change_handler);
			input.type = "checkbox";
			input.disabled = state.disabled;
			input.className = "svelte-llolt7";
			label.className = label_class_value = "checkbox " + (state.disabled? 'disabled' :'') + " svelte-llolt7";
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

			if ((changed.disabled) && label_class_value !== (label_class_value = "checkbox " + (state.disabled? 'disabled' :'') + " svelte-llolt7")) {
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
	this._state = assign(data$2(), options.data);
	if (!('disabled' in this._state)) console.warn("<Checkbox> was created without expected data property 'disabled'");
	if (!('value' in this._state)) console.warn("<Checkbox> was created without expected data property 'value'");
	if (!('label' in this._state)) console.warn("<Checkbox> was created without expected data property 'label'");

	this._fragment = create_main_fragment$2(this, this._state);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(Checkbox.prototype, protoDev);

Checkbox.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* controls/Select.html generated by Svelte v1.57.3 */

function data$3() {
    return {
        disabled: false,
        width: 'auto',
        options: [],
        optgroups: [],
    };
}
function create_main_fragment$3(component, state) {
	var div, label, text_1, div_1, select, if_block_anchor, select_updating = false, div_1_class_value;

	var if_block = (state.options.length) && create_if_block(component, state);

	var if_block_1 = (state.optgroups.length) && create_if_block_1(component, state);

	function select_change_handler() {
		select_updating = true;
		component.set({ value: selectValue(select) });
		select_updating = false;
	}

	return {
		c: function create() {
			div = createElement("div");
			label = createElement("label");
			text_1 = createText("\n\n    ");
			div_1 = createElement("div");
			select = createElement("select");
			if (if_block) if_block.c();
			if_block_anchor = createComment();
			if (if_block_1) if_block_1.c();
			this.h();
		},

		h: function hydrate() {
			label.className = "control-label";
			addListener(select, "change", select_change_handler);
			if (!('value' in state)) component.root._beforecreate.push(select_change_handler);
			select.disabled = state.disabled;
			setStyle(select, "width", state.width);
			div_1.className = div_1_class_value = "controls form-inline " + (state.disabled? 'disabled' :'');
			div.className = "control-group vis-option-type-select";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(label, div);
			label.innerHTML = state.label;
			appendNode(text_1, div);
			appendNode(div_1, div);
			appendNode(select, div_1);
			if (if_block) if_block.m(select, null);
			appendNode(if_block_anchor, select);
			if (if_block_1) if_block_1.m(select, null);

			selectOption(select, state.value);
		},

		p: function update(changed, state) {
			if (changed.label) {
				label.innerHTML = state.label;
			}

			if (state.options.length) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block(component, state);
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
					if_block_1 = create_if_block_1(component, state);
					if_block_1.c();
					if_block_1.m(select, null);
				}
			} else if (if_block_1) {
				if_block_1.u();
				if_block_1.d();
				if_block_1 = null;
			}

			if (!select_updating) selectOption(select, state.value);
			if (changed.disabled) {
				select.disabled = state.disabled;
			}

			if (changed.width) {
				setStyle(select, "width", state.width);
			}

			if ((changed.disabled) && div_1_class_value !== (div_1_class_value = "controls form-inline " + (state.disabled? 'disabled' :''))) {
				div_1.className = div_1_class_value;
			}
		},

		u: function unmount() {
			label.innerHTML = '';

			detachNode(div);
			if (if_block) if_block.u();
			if (if_block_1) if_block_1.u();
		},

		d: function destroy$$1() {
			if (if_block) if_block.d();
			if (if_block_1) if_block_1.d();
			removeListener(select, "change", select_change_handler);
		}
	};
}

// (9:12) {{#each options as opt}}
function create_each_block$1(component, state) {
	var opt = state.opt, opt_index = state.opt_index;
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

// (8:8) {{#if options.length}}
function create_if_block(component, state) {
	var each_anchor;

	var options = state.options;

	var each_blocks = [];

	for (var i = 0; i < options.length; i += 1) {
		each_blocks[i] = create_each_block$1(component, assign({}, state, {
			options: options,
			opt: options[i],
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
			var options = state.options;

			if (changed.options) {
				for (var i = 0; i < options.length; i += 1) {
					var each_context = assign({}, state, {
						options: options,
						opt: options[i],
						opt_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$1(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(each_anchor.parentNode, each_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = options.length;
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

// (14:12) {{#each optgroups as optgroup}}
function create_each_block_1(component, state) {
	var optgroup = state.optgroup, optgroup_index = state.optgroup_index;
	var optgroup_1, optgroup_1_label_value;

	var options = optgroup.options;

	var each_blocks = [];

	for (var i = 0; i < options.length; i += 1) {
		each_blocks[i] = create_each_block_2(component, assign({}, state, {
			options: options,
			opt: options[i],
			opt_index: i
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
			optgroup_index = state.optgroup_index;
			var options = optgroup.options;

			if (changed.optgroups) {
				for (var i = 0; i < options.length; i += 1) {
					var each_context = assign({}, state, {
						options: options,
						opt: options[i],
						opt_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block_2(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(optgroup_1, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = options.length;
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

// (16:16) {{#each optgroup.options as opt}}
function create_each_block_2(component, state) {
	var optgroup = state.optgroup, opt = state.opt, optgroup_index = state.optgroup_index, opt_index = state.opt_index;
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
			opt = state.opt;
			optgroup_index = state.optgroup_index;
			opt_index = state.opt_index;
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

// (13:8) {{#if optgroups.length}}
function create_if_block_1(component, state) {
	var each_anchor;

	var optgroups = state.optgroups;

	var each_blocks = [];

	for (var i = 0; i < optgroups.length; i += 1) {
		each_blocks[i] = create_each_block_1(component, assign({}, state, {
			optgroups: optgroups,
			optgroup: optgroups[i],
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
			var optgroups = state.optgroups;

			if (changed.optgroups) {
				for (var i = 0; i < optgroups.length; i += 1) {
					var each_context = assign({}, state, {
						optgroups: optgroups,
						optgroup: optgroups[i],
						optgroup_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block_1(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(each_anchor.parentNode, each_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = optgroups.length;
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
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data$3(), options.data);
	if (!('label' in this._state)) console.warn("<Select> was created without expected data property 'label'");
	if (!('disabled' in this._state)) console.warn("<Select> was created without expected data property 'disabled'");
	if (!('value' in this._state)) console.warn("<Select> was created without expected data property 'value'");
	if (!('width' in this._state)) console.warn("<Select> was created without expected data property 'width'");
	if (!('options' in this._state)) console.warn("<Select> was created without expected data property 'options'");
	if (!('optgroups' in this._state)) console.warn("<Select> was created without expected data property 'optgroups'");

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
	}

	this._fragment = create_main_fragment$3(this, this._state);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._beforecreate);
	}
}

assign(Select.prototype, protoDev);

Select.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

// `_now` : an utility's function
// -------------------------------

// A (possibly faster) way to get the current timestamp as an integer.
var _now = Date.now || function () {
	return new Date().getTime();
};

// `_throttle` : (ahem) a function's function

// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
function _throttle (func, wait, options) {
  let timeout, context, args, result;
  let previous = 0;
  if (!options) options = {};

  let later = function () {
    previous = options.leading === false ? 0 : _now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  let throttled = function () {
    let now = _now();
    if (!previous && options.leading === false) previous = now;
    let remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };

  throttled.cancel = function () {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;
  };

  return throttled;
}

function arrayToObject(o) {
    if (_isArray(o)) {
        const obj = {};
        Object.keys(o).forEach(k => obj[k] = o[k]);
        return obj;
    }
    return o;
}

/* describe/CustomColumnFormat.html generated by Svelte v1.57.3 */

function title$1(column) {
    var s = "Edit column %s";
    return s.replace('%s', `"${column ? column.title() || column.name() : '--'}"`)
}
function data$4() {
    return {
        columnFormat: {
            type: 'auto',
            ignore: false,
            'number-divisor': '-',
            'number-format': 'auto',
            'number-prepend': '',
            'number-append': '',
        },
        colTypes: [],
        divisors_opts: [
            {value:0, label: "(no change)" },
            {value:'auto', label: "(auto-detect)" },
        ],
        divisors: [{
            label: "divide by",
            options: [
                {value:3, label:'1000'},
                {value:6, label:'1 million'},
                {value:9, label:'1 billion'},
            ]
        }, {
            label: "multiply by",
            options: [
                {value:-2, label:'100'},
                {value:-3, label:'1000'},
                {value:-6, label:'1 million'},
                {value:-9, label:'1 billion'},
                {value:-12, label:'1 trillion'}
            ]
        }],
        numberFormats: [{
            label: "Decimal places",
            options: [
                {value:'n3', label: '3 (1,234.568)'},
                {value:'n2', label: '2 (1,234.57)'},
                {value:'n1', label: '1 (1,234.6)'},
                {value:'n0', label: '0 (1,235)'},
            ]
        }, {
            label: "Significant digits",
            options: [
                {value:'s6', label:'6 (1,234.57)'},
                {value:'s5', label:'5 (123.45)'},
                {value:'s4', label:'4 (12.34)'},
                {value:'s3', label:'3 (1.23)'},
                {value:'s2', label:'2 (0.12)'},
                {value:'s1', label:'1 (0.01)'},
            ]
        }]
    }
}
var methods$2 = {
    autoDivisor() {
        const chart = this.store.get('dw_chart');
        const {column} = this.get();
        const mtrSuf = dw.utils.metricSuffix(chart.locale());
        const values = column.values();
        const dim = dw.utils.significantDimension(values);
        let div = dim < -2 ? (Math.round((dim*-1) / 3) * 3) :
                    (dim > 4 ? dim*-1 : 0);
        const nvalues = values.map(function(v) {
            return v / Math.pow(10, div);
        });
        let ndim = dw.utils.significantDimension(nvalues);
        if (ndim <= 0) ndim = nvalues.reduce(function(acc, cur) {
            return Math.max(acc, Math.min(3,dw.utils.tailLength(cur)));
        }, 0);

        if (ndim == div) {
            div = 0;
            ndim = 0;
        }
        if (div > 15) {
            div = 0;
            ndim = 0;
        }

        this.set({
            columnFormat: {
                'number-divisor': div,
                'number-format': 'n'+Math.max(0, ndim),
                'number-prepend': '',
                'number-append': (div ? mtrSuf[div] || ' × 10<sup>'+div+'</sup>' : '')
            }
        });
    },
    getColumnFormat(column) {
        const chart = this.store.get('dw_chart');
        const columnFormats = arrayToObject(chart.get('metadata.data.column-format', {}));
        let columnFormat = clone(columnFormats[column.name()]);
        if (!columnFormat || columnFormat == 'auto' || columnFormat.length !== undefined) {
            // no valid column format
            columnFormat = {
                type: 'auto',
                ignore: false,
                'number-prepend': '',
                'number-append': '',
                'number-format': 'auto'
            };
        }
        return columnFormat;
    }
};

function oncreate$2() {
    const updateTable = _throttle(() => { this.fire('updateTable'); },100, {leading: false});
    const renderTable = _throttle(() => { this.fire('updateTable'); }, 100, {leading: false});

    const {column} = this.get();

    this.set({colTypes: [
        { value:'auto', label: 'auto ('+column.type()+')' },
        { value:'text', label: 'Text' },
        { value:'number', label: 'Number' },
        { value:'date', label: 'Date' },
    ]});

    this.set({columnFormat: this.getColumnFormat(column)});

    this.observe('column', (col) => {
        this.set({columnFormat: this.getColumnFormat(col)});
        const {colTypes} = this.get();
        colTypes[0].label = 'auto ('+column.type()+')';
    });

    this.observe('columnFormat', (colFormat) => {
        const chrt = this.store.get('dw_chart');
        const {column} = this.get();
        const columnFormats = arrayToObject(chrt.get('metadata.data.column-format', {}));
        const oldFormat = columnFormats[column.name()];
        if (!oldFormat || JSON.stringify(oldFormat) != JSON.stringify(colFormat)) {
            if (colFormat['number-divisor'] == 'auto') {
                // stop here and compute divisor automatically
                setTimeout(() => this.autoDivisor(), 100);
                return;
            }
            columnFormats[column.name()] = clone(colFormat);
            chrt.set('metadata.data.column-format', columnFormats);
            if (chrt.saveSoon) chrt.saveSoon();
            if (!oldFormat || oldFormat.type != colFormat.type) updateTable();
            else renderTable();
        }
    });
}
function create_main_fragment$4(component, state) {
	var div, h3, text, text_1, div_1, select_updating = {}, text_2, checkbox_updating = {}, text_3, hr, text_4;

	var select_initial_data = {
		label: "Column type",
		options: state.colTypes,
		width: "180px"
	};
	if ('type' in state.columnFormat) {
		select_initial_data.value = state.columnFormat.type;
		select_updating.value = true;
	}
	var select = new Select({
		root: component.root,
		data: select_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!select_updating.value && changed.value) {
				state.columnFormat.type = childState.value;
				newState.columnFormat = state.columnFormat;
			}
			component._set(newState);
			select_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		select._bind({ value: 1 }, select.get());
	});

	var checkbox_initial_data = { label: "Hide column from visualization" };
	if ('ignore' in state.columnFormat) {
		checkbox_initial_data.value = state.columnFormat.ignore;
		checkbox_updating.value = true;
	}
	var checkbox = new Checkbox({
		root: component.root,
		data: checkbox_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!checkbox_updating.value && changed.value) {
				state.columnFormat.ignore = childState.value;
				newState.columnFormat = state.columnFormat;
			}
			component._set(newState);
			checkbox_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		checkbox._bind({ value: 1 }, checkbox.get());
	});

	var if_block = (state.column && state.column.type() == 'number') && create_if_block$1(component, state);

	return {
		c: function create() {
			div = createElement("div");
			h3 = createElement("h3");
			text = createText(state.title);
			text_1 = createText("\n\n    ");
			div_1 = createElement("div");
			select._fragment.c();
			text_2 = createText("\n\n        ");
			checkbox._fragment.c();
			text_3 = createText("\n\n        ");
			hr = createElement("hr");
			text_4 = createText("\n\n        ");
			if (if_block) if_block.c();
			this.h();
		},

		h: function hydrate() {
			h3.className = "first";
			div_1.className = "form-horizontal";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(h3, div);
			appendNode(text, h3);
			appendNode(text_1, div);
			appendNode(div_1, div);
			select._mount(div_1, null);
			appendNode(text_2, div_1);
			checkbox._mount(div_1, null);
			appendNode(text_3, div_1);
			appendNode(hr, div_1);
			appendNode(text_4, div_1);
			if (if_block) if_block.m(div_1, null);
		},

		p: function update(changed, state) {
			if (changed.title) {
				text.data = state.title;
			}

			var select_changes = {};
			select_changes.label = "Column type";
			if (changed.colTypes) select_changes.options = state.colTypes;
			if (!select_updating.value && changed.columnFormat) {
				select_changes.value = state.columnFormat.type;
				select_updating.value = true;
			}
			select._set(select_changes);
			select_updating = {};

			var checkbox_changes = {};
			checkbox_changes.label = "Hide column from visualization";
			if (!checkbox_updating.value && changed.columnFormat) {
				checkbox_changes.value = state.columnFormat.ignore;
				checkbox_updating.value = true;
			}
			checkbox._set(checkbox_changes);
			checkbox_updating = {};

			if (state.column && state.column.type() == 'number') {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$1(component, state);
					if_block.c();
					if_block.m(div_1, null);
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
			select.destroy(false);
			checkbox.destroy(false);
			if (if_block) if_block.d();
		}
	};
}

// (19:8) {{#if column && column.type() == 'number'}}
function create_if_block$1(component, state) {
	var select_updating = {}, text, select_1_updating = {}, text_1, div, label, text_2_value = "Prepend/append", text_2, text_4, div_1, input, input_updating = false, text_5, input_1, input_1_updating = false;

	var select_initial_data = {
		label: "Round numbers to",
		options: [
                {value:'-',label: "(auto-detect - case by case)"},
                {value:'auto',label: "(auto-detect - one for all)" }],
		optgroups: state.numberFormats,
		width: "180px"
	};
	if ('number-format' in state.columnFormat) {
		select_initial_data.value = state.columnFormat['number-format'];
		select_updating.value = true;
	}
	var select = new Select({
		root: component.root,
		data: select_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!select_updating.value && changed.value) {
				state.columnFormat['number-format'] = childState.value;
				newState.columnFormat = state.columnFormat;
			}
			component._set(newState);
			select_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		select._bind({ value: 1 }, select.get());
	});

	var select_1_initial_data = {
		label: "Divide/multiply by",
		options: state.divisors_opts,
		optgroups: state.divisors,
		width: "180px"
	};
	if ('number-divisor' in state.columnFormat) {
		select_1_initial_data.value = state.columnFormat['number-divisor'];
		select_1_updating.value = true;
	}
	var select_1 = new Select({
		root: component.root,
		data: select_1_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!select_1_updating.value && changed.value) {
				state.columnFormat['number-divisor'] = childState.value;
				newState.columnFormat = state.columnFormat;
			}
			component._set(newState);
			select_1_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		select_1._bind({ value: 1 }, select_1.get());
	});

	function input_input_handler() {
		var state = component.get();
		input_updating = true;
		state.columnFormat['number-prepend'] = input.value;
		component.set({ columnFormat: state.columnFormat });
		input_updating = false;
	}

	function input_1_input_handler() {
		var state = component.get();
		input_1_updating = true;
		state.columnFormat['number-append'] = input_1.value;
		component.set({ columnFormat: state.columnFormat });
		input_1_updating = false;
	}

	return {
		c: function create() {
			select._fragment.c();
			text = createText("\n        ");
			select_1._fragment.c();
			text_1 = createText("\n\n        ");
			div = createElement("div");
			label = createElement("label");
			text_2 = createText(text_2_value);
			text_4 = createText("\n            ");
			div_1 = createElement("div");
			input = createElement("input");
			text_5 = createText("\n                #\n                ");
			input_1 = createElement("input");
			this.h();
		},

		h: function hydrate() {
			label.className = "control-label";
			addListener(input, "input", input_input_handler);
			setStyle(input, "width", "6ex");
			setStyle(input, "text-align", "right");
			input.dataset.lpignore = "true";
			input.name = "prepend";
			input.type = "text";
			addListener(input_1, "input", input_1_input_handler);
			setStyle(input_1, "width", "6ex");
			input_1.dataset.lpignore = "true";
			input_1.name = "append";
			input_1.type = "text";
			div_1.className = "controls form-inline";
			div.className = "control-group vis-option-type-select";
		},

		m: function mount(target, anchor) {
			select._mount(target, anchor);
			insertNode(text, target, anchor);
			select_1._mount(target, anchor);
			insertNode(text_1, target, anchor);
			insertNode(div, target, anchor);
			appendNode(label, div);
			appendNode(text_2, label);
			appendNode(text_4, div);
			appendNode(div_1, div);
			appendNode(input, div_1);

			input.value = state.columnFormat['number-prepend'];

			appendNode(text_5, div_1);
			appendNode(input_1, div_1);

			input_1.value = state.columnFormat['number-append'];
		},

		p: function update(changed, state) {
			var select_changes = {};
			select_changes.label = "Round numbers to";
			select_changes.options = [
                {value:'-',label: "(auto-detect - case by case)"},
                {value:'auto',label: "(auto-detect - one for all)" }];
			if (changed.numberFormats) select_changes.optgroups = state.numberFormats;
			if (!select_updating.value && changed.columnFormat) {
				select_changes.value = state.columnFormat['number-format'];
				select_updating.value = true;
			}
			select._set(select_changes);
			select_updating = {};

			var select_1_changes = {};
			select_1_changes.label = "Divide/multiply by";
			if (changed.divisors_opts) select_1_changes.options = state.divisors_opts;
			if (changed.divisors) select_1_changes.optgroups = state.divisors;
			if (!select_1_updating.value && changed.columnFormat) {
				select_1_changes.value = state.columnFormat['number-divisor'];
				select_1_updating.value = true;
			}
			select_1._set(select_1_changes);
			select_1_updating = {};

			if (!input_updating) input.value = state.columnFormat['number-prepend'];
			if (!input_1_updating) input_1.value = state.columnFormat['number-append'];
		},

		u: function unmount() {
			select._unmount();
			detachNode(text);
			select_1._unmount();
			detachNode(text_1);
			detachNode(div);
		},

		d: function destroy$$1() {
			select.destroy(false);
			select_1.destroy(false);
			removeListener(input, "input", input_input_handler);
			removeListener(input_1, "input", input_1_input_handler);
		}
	};
}

function CustomColumnFormat(options) {
	this._debugName = '<CustomColumnFormat>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data$4(), options.data);
	this._recompute({ column: 1 }, this._state);
	if (!('column' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'column'");
	if (!('title' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'title'");
	if (!('colTypes' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'colTypes'");
	if (!('columnFormat' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'columnFormat'");
	if (!('numberFormats' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'numberFormats'");
	if (!('divisors_opts' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'divisors_opts'");
	if (!('divisors' in this._state)) console.warn("<CustomColumnFormat> was created without expected data property 'divisors'");

	var _oncreate = oncreate$2.bind(this);

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$4(this, this._state);

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

assign(CustomColumnFormat.prototype, methods$2, protoDev);

CustomColumnFormat.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('title' in newState && !this._updatingReadonlyProperty) throw new Error("<CustomColumnFormat>: Cannot set read-only property 'title'");
};

CustomColumnFormat.prototype._recompute = function _recompute(changed, state) {
	if (changed.column) {
		if (this._differs(state.title, (state.title = title$1(state.column)))) changed.title = true;
	}
};

/* describe/App.html generated by Svelte v1.57.3 */

function searchIndexSafe(searchIndex, searchResults) {
    if (searchIndex<0) searchIndex+=searchResults.length;
    searchIndex = searchIndex % searchResults.length;
    return searchIndex;
}
function customColumn(activeColumn, forceColumnFormat) {
    return activeColumn && !forceColumnFormat && activeColumn.isComputed ? activeColumn : false;
}
function columnFormat(activeColumn, forceColumnFormat) {
    return activeColumn && (!activeColumn.isComputed || forceColumnFormat) ? activeColumn : false;
}
function columns(activeColumn) {
    const ds = chart.dataset();
    if (!activeColumn) return ds ? ds.columns() : [];
    try {
        return ds.columns().filter(col => !col.isComputed);
    } catch(e) {
        return [];
    }
}
function sorting(sortBy, sortDir) {
    return {sortBy,sortDir};
}
function data$5() {
    return {
        locale: 'en-US',
        search: '',
        chartData: '',
        transpose: false,
        firstRowIsHeader: true,
        searchIndex: 0,
        activeColumn: false,
        customColumn: false,
        columnFormat: false,
        multiSelection: false,
        forceColumnFormat: false,
        searchResults: [],
        sortBy: '-',
        sortDir: true,
    };
}
var methods$3 = {
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
        this.set({activeColumn: false});
        this.set({transpose: !this.get('transpose')});
        setTimeout(() => this.refs.hot.update(), 500);
        // ;
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
    },
    addComputedColumn() {
        const chart = this.store.get('dw_chart');
        const ds = chart.dataset();
        const computed = arrayToObject(chart.get('metadata.describe.computed-columns', {}));
        // find new id
        let i = 1;
        while (ds.hasColumn(`Column ${i}`)) {
            i++;
        }
        const id = `Column ${i}`;
        computed[id] = '';
        chart.set('metadata.describe.computed-columns', computed);
        chart.saveSoon();
        const ds2 = chart.dataset(true);
        this.refs.hot.update();
        this.set({ activeColumn: ds2.column(id) });
    },
    sort(event, col, ascending) {
        event.preventDefault();
        event.stopPropagation();
        this.set({sortBy: col, sortDir: ascending});
        // hide the dropdown menu
        this.refs.sortDropdownGroup.classList.remove('open');
    },
    force(event, val=true) {
        event.preventDefault();
        this.set({forceColumnFormat:val});
    },
    hideMultiple(columns, hide) {
        console.log(columns.map(c=>c.name()), hide);
        const chart = this.store.get('dw_chart');
        const colFmt = chart.get('metadata.data.column-format', {});
        columns.forEach(col => {
            if (colFmt[col.name()]) colFmt[col.name()].ignore = hide;
            else {
                colFmt[col.name()] = {type:'auto',ignore:hide};
            }
        });
        chart.set('metadata.data.column-format', colFmt);
        chart.saveSoon();
        setTimeout(() => {
            this.refs.hot.get('hot').render();
        }, 10);
        this.set({multiSelection: false});
    }
};

function oncreate$3() {
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
            this.store.get('dw_chart').set(`${metadata_key}`, svelte_value);
            if (svelte_key == 'locale') {
                if (!svelte_value) return;
                this.store.get('dw_chart')
                    .locale(svelte_value, () => {
                        this.refs.hot.render();
                    });
            }
        });
    };
    sync('transpose', 'metadata.data.transpose');
    sync('firstRowIsHeader', 'metadata.data.horizontal-header');
    sync('locale', 'language');
    this.observe('activeColumn', (ac) => {
        if (!ac) this.set({forceColumnFormat:false});
    });
}
function create_main_fragment$5(component, state) {
	var div, div_1, div_2, div_3, text, p, raw_value = "Not happy with the new page? We'd love to <a href='mailto:hello@datawrapper.de?subject=Feedback'>know why!</a><br> You can switch to the old version <a href='?beta=0'>here</a>", text_3, div_4, div_5, raw_1_value = "Click on table header<br>to edit column properties", raw_1_after, text_4, img, text_6, div_6, div_7, div_8, button, raw_2_value = "Sort view by", raw_2_after, text_7, span, text_9, ul, li, a, raw_3_value = "No sorting", li_class_value, text_12, div_9, i, text_13, div_10, input, input_updating = false, input_placeholder_value, input_class_value, text_14, div_10_class_value, text_16, text_19, handsontable_updating = {}, text_20, div_11, button_1, img_1, text_21, text_22_value = "Swap rows and columns (transpose)", text_22, text_23, button_2, i_1, text_24, text_25_value = "Add column", text_25, text_26, text_27, button_3, i_2, text_28, text_29_value = "Revert changes", text_29, text_30, button_3_class_value;

	function select_block_type(state) {
		if (state.customColumn) return create_if_block$2;
		if (state.columnFormat) return create_if_block_1$1;
		if (state.multiSelection) return create_if_block_3;
		return create_if_block_4;
	}

	var current_block_type = select_block_type(state);
	var if_block = current_block_type(component, state);

	function click_handler(event) {
		component.sort(event, '-');
	}

	var columns = state.columns;

	var each_blocks = [];

	for (var i_3 = 0; i_3 < columns.length; i_3 += 1) {
		each_blocks[i_3] = create_each_block_1$1(component, assign({}, state, {
			columns: columns,
			col: columns[i_3],
			col_index: i_3
		}));
	}

	function input_input_handler() {
		input_updating = true;
		component.set({ search: input.value });
		input_updating = false;
	}

	function keypress_handler(event) {
		component.keyPress(event);
	}

	var if_block_3 = (state.searchResults.length > 0) && create_if_block_5(component, state);

	var if_block_4 = (state.search) && create_if_block_6(component, state);

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
	if ('sorting' in state) {
		handsontable_initial_data.sorting = state.sorting
                ;
		handsontable_updating.sorting = true;
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
		handsontable_initial_data.searchIndex = state.searchIndex
                ;
		handsontable_updating.searchIndex = true;
	}
	if ('multiSelection' in state) {
		handsontable_initial_data.multiSelection = state.multiSelection
                ;
		handsontable_updating.multiSelection = true;
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

			if (!handsontable_updating.sorting && changed.sorting) {
				newState.sorting = childState.sorting;
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

			if (!handsontable_updating.multiSelection && changed.multiSelection) {
				newState.multiSelection = childState.multiSelection;
			}
			component._set(newState);
			handsontable_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		handsontable._bind({ data: 1, transpose: 1, firstRowIsHeader: 1, activeColumn: 1, sorting: 1, search: 1, searchResults: 1, searchIndex: 1, multiSelection: 1 }, handsontable.get());
	});

	handsontable.on("resetSort", function(event) {
		component.set({sortBy:'-'});
	});

	component.refs.hot = handsontable;

	function click_handler_3(event) {
		component.toggleTranspose();
	}

	function click_handler_4(event) {
		component.addComputedColumn();
	}

	function click_handler_5(event) {
		component.revertChanges();
	}

	return {
		c: function create() {
			div = createElement("div");
			div_1 = createElement("div");
			div_2 = createElement("div");
			div_3 = createElement("div");
			if_block.c();
			text = createText("\n\n                ");
			p = createElement("p");
			text_3 = createText("\n        ");
			div_4 = createElement("div");
			div_5 = createElement("div");
			raw_1_after = createElement('noscript');
			text_4 = createText(" ");
			img = createElement("img");
			text_6 = createText("\n            ");
			div_6 = createElement("div");
			div_7 = createElement("div");
			div_8 = createElement("div");
			button = createElement("button");
			raw_2_after = createElement('noscript');
			text_7 = createText("… ");
			span = createElement("span");
			text_9 = createText("\n                        ");
			ul = createElement("ul");
			li = createElement("li");
			a = createElement("a");

			for (var i_3 = 0; i_3 < each_blocks.length; i_3 += 1) {
				each_blocks[i_3].c();
			}

			text_12 = createText("\n\n                ");
			div_9 = createElement("div");
			i = createElement("i");
			text_13 = createText("\n                    ");
			div_10 = createElement("div");
			input = createElement("input");
			text_14 = createText("\n                        ");
			if (if_block_3) if_block_3.c();
			text_16 = createText("\n\n                    ");
			if (if_block_4) if_block_4.c();
			text_19 = createText("\n\n            ");
			handsontable._fragment.c();
			text_20 = createText("\n\n            ");
			div_11 = createElement("div");
			button_1 = createElement("button");
			img_1 = createElement("img");
			text_21 = createText(" ");
			text_22 = createText(text_22_value);
			text_23 = createText("\n\n                ");
			button_2 = createElement("button");
			i_1 = createElement("i");
			text_24 = createText(" ");
			text_25 = createText(text_25_value);
			text_26 = createText("…");
			text_27 = createText("\n\n                ");
			button_3 = createElement("button");
			i_2 = createElement("i");
			text_28 = createText(" ");
			text_29 = createText(text_29_value);
			text_30 = createText("...");
			this.h();
		},

		h: function hydrate() {
			p.className = "not-happy";
			div_3.className = "sidebar";
			div_2.className = "span4";
			img.src = "/static/img/arrow.svg";
			div_5.className = "help svelte-1mhp3v1";
			span.className = "caret";
			button.className = "btn dropdown-toggle";
			button.dataset.toggle = "dropdown";
			a.href = "#s";
			a.className = "svelte-1mhp3v1";
			addListener(a, "click", click_handler);
			li.className = li_class_value = '-'==state.sortBy?'active':'';
			ul.className = "dropdown-menu sort-menu";
			div_8.className = "btn-group";
			div_7.className = "sort-box svelte-1mhp3v1";
			i.className = "im im-magnifier svelte-1mhp3v1";
			addListener(input, "input", input_input_handler);
			input.type = "text";
			input.placeholder = input_placeholder_value = "Search data table";
			input.className = input_class_value = "" + (state.searchResults.length > 0?'with-results':'') + " search-query" + " svelte-1mhp3v1";
			addListener(input, "keypress", keypress_handler);
			div_10.className = div_10_class_value = state.searchResults.length > 0 ? 'input-append' : '';
			div_9.className = "search-box form-search svelte-1mhp3v1";
			div_6.className = "pull-right";
			setStyle(div_6, "margin-bottom", "10px");
			img_1.src = "/static/css/chart-editor/transpose.png";
			img_1.className = "svelte-1mhp3v1";
			button_1.className = "btn transpose svelte-1mhp3v1";
			addListener(button_1, "click", click_handler_3);
			i_1.className = "fa fa-calculator";
			button_2.className = "btn computed-columns";
			addListener(button_2, "click", click_handler_4);
			i_2.className = "fa fa-undo";
			button_3.className = button_3_class_value = "btn " + (state.has_changes?'':'disabled') + " svelte-1mhp3v1";
			button_3.id = "reset-data-changes";
			addListener(button_3, "click", click_handler_5);
			div_11.className = "buttons below-table pull-right svelte-1mhp3v1";
			div_4.className = "span8 svelte-1mhp3v1";
			div_1.className = "row";
			div.className = "chart-editor";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(div_1, div);
			appendNode(div_2, div_1);
			appendNode(div_3, div_2);
			if_block.m(div_3, null);
			appendNode(text, div_3);
			appendNode(p, div_3);
			p.innerHTML = raw_value;
			appendNode(text_3, div_1);
			appendNode(div_4, div_1);
			appendNode(div_5, div_4);
			appendNode(raw_1_after, div_5);
			raw_1_after.insertAdjacentHTML("beforebegin", raw_1_value);
			appendNode(text_4, div_5);
			appendNode(img, div_5);
			appendNode(text_6, div_4);
			appendNode(div_6, div_4);
			appendNode(div_7, div_6);
			appendNode(div_8, div_7);
			appendNode(button, div_8);
			appendNode(raw_2_after, button);
			raw_2_after.insertAdjacentHTML("beforebegin", raw_2_value);
			appendNode(text_7, button);
			appendNode(span, button);
			appendNode(text_9, div_8);
			appendNode(ul, div_8);
			appendNode(li, ul);
			appendNode(a, li);
			a.innerHTML = raw_3_value;

			for (var i_3 = 0; i_3 < each_blocks.length; i_3 += 1) {
				each_blocks[i_3].m(ul, null);
			}

			component.refs.sortDropdownGroup = div_8;
			appendNode(text_12, div_6);
			appendNode(div_9, div_6);
			appendNode(i, div_9);
			appendNode(text_13, div_9);
			appendNode(div_10, div_9);
			appendNode(input, div_10);
			component.refs.search = input;

			input.value = state.search;

			appendNode(text_14, div_10);
			if (if_block_3) if_block_3.m(div_10, null);
			appendNode(text_16, div_9);
			if (if_block_4) if_block_4.m(div_9, null);
			appendNode(text_19, div_4);
			handsontable._mount(div_4, null);
			appendNode(text_20, div_4);
			appendNode(div_11, div_4);
			appendNode(button_1, div_11);
			appendNode(img_1, button_1);
			appendNode(text_21, button_1);
			appendNode(text_22, button_1);
			appendNode(text_23, div_11);
			appendNode(button_2, div_11);
			appendNode(i_1, button_2);
			appendNode(text_24, button_2);
			appendNode(text_25, button_2);
			appendNode(text_26, button_2);
			appendNode(text_27, div_11);
			appendNode(button_3, div_11);
			appendNode(i_2, button_3);
			appendNode(text_28, button_3);
			appendNode(text_29, button_3);
			appendNode(text_30, button_3);
		},

		p: function update(changed, state) {
			if (current_block_type === (current_block_type = select_block_type(state)) && if_block) {
				if_block.p(changed, state);
			} else {
				if_block.u();
				if_block.d();
				if_block = current_block_type(component, state);
				if_block.c();
				if_block.m(div_3, text);
			}

			if ((changed.sortBy) && li_class_value !== (li_class_value = '-'==state.sortBy?'active':'')) {
				li.className = li_class_value;
			}

			var columns = state.columns;

			if (changed.columns || changed.sortBy) {
				for (var i_3 = 0; i_3 < columns.length; i_3 += 1) {
					var each_context = assign({}, state, {
						columns: columns,
						col: columns[i_3],
						col_index: i_3
					});

					if (each_blocks[i_3]) {
						each_blocks[i_3].p(changed, each_context);
					} else {
						each_blocks[i_3] = create_each_block_1$1(component, each_context);
						each_blocks[i_3].c();
						each_blocks[i_3].m(ul, null);
					}
				}

				for (; i_3 < each_blocks.length; i_3 += 1) {
					each_blocks[i_3].u();
					each_blocks[i_3].d();
				}
				each_blocks.length = columns.length;
			}

			if (!input_updating) input.value = state.search;
			if ((changed.searchResults) && input_class_value !== (input_class_value = "" + (state.searchResults.length > 0?'with-results':'') + " search-query" + " svelte-1mhp3v1")) {
				input.className = input_class_value;
			}

			if (state.searchResults.length > 0) {
				if (!if_block_3) {
					if_block_3 = create_if_block_5(component, state);
					if_block_3.c();
					if_block_3.m(div_10, null);
				}
			} else if (if_block_3) {
				if_block_3.u();
				if_block_3.d();
				if_block_3 = null;
			}

			if ((changed.searchResults) && div_10_class_value !== (div_10_class_value = state.searchResults.length > 0 ? 'input-append' : '')) {
				div_10.className = div_10_class_value;
			}

			if (state.search) {
				if (if_block_4) {
					if_block_4.p(changed, state);
				} else {
					if_block_4 = create_if_block_6(component, state);
					if_block_4.c();
					if_block_4.m(div_9, null);
				}
			} else if (if_block_4) {
				if_block_4.u();
				if_block_4.d();
				if_block_4 = null;
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
			if (!handsontable_updating.sorting && changed.sorting) {
				handsontable_changes.sorting = state.sorting
                ;
				handsontable_updating.sorting = true;
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
				handsontable_changes.searchIndex = state.searchIndex
                ;
				handsontable_updating.searchIndex = true;
			}
			if (!handsontable_updating.multiSelection && changed.multiSelection) {
				handsontable_changes.multiSelection = state.multiSelection
                ;
				handsontable_updating.multiSelection = true;
			}
			handsontable._set(handsontable_changes);
			handsontable_updating = {};

			if ((changed.has_changes) && button_3_class_value !== (button_3_class_value = "btn " + (state.has_changes?'':'disabled') + " svelte-1mhp3v1")) {
				button_3.className = button_3_class_value;
			}
		},

		u: function unmount() {
			p.innerHTML = '';

			detachBefore(raw_1_after);

			detachBefore(raw_2_after);

			a.innerHTML = '';

			detachNode(div);
			if_block.u();

			for (var i_3 = 0; i_3 < each_blocks.length; i_3 += 1) {
				each_blocks[i_3].u();
			}

			if (if_block_3) if_block_3.u();
			if (if_block_4) if_block_4.u();
		},

		d: function destroy$$1() {
			if_block.d();
			removeListener(a, "click", click_handler);

			destroyEach(each_blocks);

			if (component.refs.sortDropdownGroup === div_8) component.refs.sortDropdownGroup = null;
			removeListener(input, "input", input_input_handler);
			removeListener(input, "keypress", keypress_handler);
			if (component.refs.search === input) component.refs.search = null;
			if (if_block_3) if_block_3.d();
			if (if_block_4) if_block_4.d();
			handsontable.destroy(false);
			if (component.refs.hot === handsontable) component.refs.hot = null;
			removeListener(button_1, "click", click_handler_3);
			removeListener(button_2, "click", click_handler_4);
			removeListener(button_3, "click", click_handler_5);
		}
	};
}

// (24:16) {{#if columnFormat.isComputed}}
function create_if_block_2(component, state) {
	var button, i, text, text_1_value = "Return to formula editor", text_1;

	function click_handler(event) {
		component.force(event, false);
	}

	return {
		c: function create() {
			button = createElement("button");
			i = createElement("i");
			text = createText(" ");
			text_1 = createText(text_1_value);
			this.h();
		},

		h: function hydrate() {
			i.className = "fa  fa-chevron-left";
			button.className = "btn";
			addListener(button, "click", click_handler);
		},

		m: function mount(target, anchor) {
			insertNode(button, target, anchor);
			appendNode(i, button);
			appendNode(text, button);
			appendNode(text_1, button);
		},

		u: function unmount() {
			detachNode(button);
		},

		d: function destroy$$1() {
			removeListener(button, "click", click_handler);
		}
	};
}

// (57:20) {{#each locales as locale}}
function create_each_block$2(component, state) {
	var locale = state.locale, locale_index = state.locale_index;
	var option, text_value = locale.label, text, text_1, text_2_value = locale.value, text_2, text_3, option_value_value;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			text_1 = createText(" (");
			text_2 = createText(text_2_value);
			text_3 = createText(")");
			this.h();
		},

		h: function hydrate() {
			option.__value = option_value_value = locale.value;
			option.value = option.__value;
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
			appendNode(text_1, option);
			appendNode(text_2, option);
			appendNode(text_3, option);
		},

		p: function update(changed, state) {
			locale = state.locale;
			locale_index = state.locale_index;
			if ((changed.locales) && text_value !== (text_value = locale.label)) {
				text.data = text_value;
			}

			if ((changed.locales) && text_2_value !== (text_2_value = locale.value)) {
				text_2.data = text_2_value;
			}

			if ((changed.locales) && option_value_value !== (option_value_value = locale.value)) {
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

// (5:16) {{#if customColumn}}
function create_if_block$2(component, state) {
	var computedcolumneditor_updating = {}, text, button, text_1_value = "Edit column format", text_1;

	var computedcolumneditor_initial_data = {};
	if ('customColumn' in state) {
		computedcolumneditor_initial_data.column = state.customColumn;
		computedcolumneditor_updating.column = true;
	}
	if ('columns' in state) {
		computedcolumneditor_initial_data.columns = state.columns ;
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

			if (!computedcolumneditor_updating.columns && changed.columns) {
				newState.columns = childState.columns;
			}
			component._set(newState);
			computedcolumneditor_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		computedcolumneditor._bind({ column: 1, columns: 1 }, computedcolumneditor.get());
	});

	computedcolumneditor.on("updateTable", function(event) {
		component.refs.hot.update();
	});
	computedcolumneditor.on("renderTable", function(event) {
		component.refs.hot.render();
	});
	computedcolumneditor.on("unselect", function(event) {
		component.set({activeColumn:false});
	});

	function click_handler(event) {
		component.force(event, true);
	}

	return {
		c: function create() {
			computedcolumneditor._fragment.c();
			text = createText("\n\n               ");
			button = createElement("button");
			text_1 = createText(text_1_value);
			this.h();
		},

		h: function hydrate() {
			button.className = "btn";
			addListener(button, "click", click_handler);
		},

		m: function mount(target, anchor) {
			computedcolumneditor._mount(target, anchor);
			insertNode(text, target, anchor);
			insertNode(button, target, anchor);
			appendNode(text_1, button);
		},

		p: function update(changed, state) {
			var computedcolumneditor_changes = {};
			if (!computedcolumneditor_updating.column && changed.customColumn) {
				computedcolumneditor_changes.column = state.customColumn;
				computedcolumneditor_updating.column = true;
			}
			if (!computedcolumneditor_updating.columns && changed.columns) {
				computedcolumneditor_changes.columns = state.columns ;
				computedcolumneditor_updating.columns = true;
			}
			computedcolumneditor._set(computedcolumneditor_changes);
			computedcolumneditor_updating = {};
		},

		u: function unmount() {
			computedcolumneditor._unmount();
			detachNode(text);
			detachNode(button);
		},

		d: function destroy$$1() {
			computedcolumneditor.destroy(false);
			removeListener(button, "click", click_handler);
		}
	};
}

// (16:39) 
function create_if_block_1$1(component, state) {
	var customcolumnformat_updating = {}, text, if_block_anchor;

	var customcolumnformat_initial_data = {};
	if ('columnFormat' in state) {
		customcolumnformat_initial_data.column = state.columnFormat;
		customcolumnformat_updating.column = true;
	}
	if ('columns' in state) {
		customcolumnformat_initial_data.columns = state.columns ;
		customcolumnformat_updating.columns = true;
	}
	var customcolumnformat = new CustomColumnFormat({
		root: component.root,
		data: customcolumnformat_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!customcolumnformat_updating.column && changed.column) {
				newState.columnFormat = childState.column;
			}

			if (!customcolumnformat_updating.columns && changed.columns) {
				newState.columns = childState.columns;
			}
			component._set(newState);
			customcolumnformat_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		customcolumnformat._bind({ column: 1, columns: 1 }, customcolumnformat.get());
	});

	customcolumnformat.on("updateTable", function(event) {
		component.refs.hot.update();
	});
	customcolumnformat.on("renderTable", function(event) {
		component.refs.hot.render();
	});

	var if_block = (state.columnFormat.isComputed) && create_if_block_2(component, state);

	return {
		c: function create() {
			customcolumnformat._fragment.c();
			text = createText("\n\n                ");
			if (if_block) if_block.c();
			if_block_anchor = createComment();
		},

		m: function mount(target, anchor) {
			customcolumnformat._mount(target, anchor);
			insertNode(text, target, anchor);
			if (if_block) if_block.m(target, anchor);
			insertNode(if_block_anchor, target, anchor);
		},

		p: function update(changed, state) {
			var customcolumnformat_changes = {};
			if (!customcolumnformat_updating.column && changed.columnFormat) {
				customcolumnformat_changes.column = state.columnFormat;
				customcolumnformat_updating.column = true;
			}
			if (!customcolumnformat_updating.columns && changed.columns) {
				customcolumnformat_changes.columns = state.columns ;
				customcolumnformat_updating.columns = true;
			}
			customcolumnformat._set(customcolumnformat_changes);
			customcolumnformat_updating = {};

			if (state.columnFormat.isComputed) {
				if (!if_block) {
					if_block = create_if_block_2(component, state);
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
			customcolumnformat._unmount();
			detachNode(text);
			if (if_block) if_block.u();
			detachNode(if_block_anchor);
		},

		d: function destroy$$1() {
			customcolumnformat.destroy(false);
			if (if_block) if_block.d();
		}
	};
}

// (28:41) 
function create_if_block_3(component, state) {
	var h3, text_1, ul, li, button, li_1, button_1;

	function click_handler(event) {
		var state = component.get();
		component.hideMultiple(state.multiSelection, false);
	}

	function click_handler_1(event) {
		var state = component.get();
		component.hideMultiple(state.multiSelection, true);
	}

	return {
		c: function create() {
			h3 = createElement("h3");
			h3.textContent = "Show/hide multiple columns";
			text_1 = createText("\n\n                ");
			ul = createElement("ul");
			li = createElement("li");
			button = createElement("button");
			button.innerHTML = "<i class=\"fa fa-eye\"></i> Show selected columns";
			li_1 = createElement("li");
			button_1 = createElement("button");
			button_1.innerHTML = "<i class=\"fa fa-eye-slash\"></i> Hide selected columns";
			this.h();
		},

		h: function hydrate() {
			h3.className = "first";
			button.className = "btn";
			addListener(button, "click", click_handler);
			button_1.className = "btn";
			addListener(button_1, "click", click_handler_1);
			ul.className = "unstyled";
		},

		m: function mount(target, anchor) {
			insertNode(h3, target, anchor);
			insertNode(text_1, target, anchor);
			insertNode(ul, target, anchor);
			appendNode(li, ul);
			appendNode(button, li);
			appendNode(li_1, ul);
			appendNode(button_1, li_1);
		},

		p: noop,

		u: function unmount() {
			detachNode(h3);
			detachNode(text_1);
			detachNode(ul);
		},

		d: function destroy$$1() {
			removeListener(button, "click", click_handler);
			removeListener(button_1, "click", click_handler_1);
		}
	};
}

// (43:16) {{else}}
function create_if_block_4(component, state) {
	var h3, text_value = "Make sure the data looks right", text, text_1, p, text_2_value = "Please make sure that Datawrapper interprets your data correctly. In the table columns should be shown in blue, dates in green and text in black.", text_2, text_3, checkbox_updating = {}, text_4, h4, text_5_value = "Output locale", text_5, text_6, p_1, text_7_value = "Defines decimal and thousand separators as well as translation of month and weekday names.", text_7, text_8, select, select_updating = false, text_9, hr, text_10, div, a, i, text_11, text_12_value = "Back", text_12, text_13, a_1, text_14_value = "Proceed", text_14, text_15, i_1;

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
			component._set(newState);
			checkbox_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		checkbox._bind({ value: 1 }, checkbox.get());
	});

	var locales = state.locales;

	var each_blocks = [];

	for (var i_2 = 0; i_2 < locales.length; i_2 += 1) {
		each_blocks[i_2] = create_each_block$2(component, assign({}, state, {
			locales: locales,
			locale: locales[i_2],
			locale_index: i_2
		}));
	}

	function select_change_handler() {
		select_updating = true;
		component.set({ locale: selectValue(select) });
		select_updating = false;
	}

	return {
		c: function create() {
			h3 = createElement("h3");
			text = createText(text_value);
			text_1 = createText("\n\n                ");
			p = createElement("p");
			text_2 = createText(text_2_value);
			text_3 = createText("\n\n                ");
			checkbox._fragment.c();
			text_4 = createText("\n\n                ");
			h4 = createElement("h4");
			text_5 = createText(text_5_value);
			text_6 = createText("\n\n                ");
			p_1 = createElement("p");
			text_7 = createText(text_7_value);
			text_8 = createText("\n\n                ");
			select = createElement("select");

			for (var i_2 = 0; i_2 < each_blocks.length; i_2 += 1) {
				each_blocks[i_2].c();
			}

			text_9 = createText("\n\n                ");
			hr = createElement("hr");
			text_10 = createText("\n\n                ");
			div = createElement("div");
			a = createElement("a");
			i = createElement("i");
			text_11 = createText(" ");
			text_12 = createText(text_12_value);
			text_13 = createText("\n                    ");
			a_1 = createElement("a");
			text_14 = createText(text_14_value);
			text_15 = createText(" ");
			i_1 = createElement("i");
			this.h();
		},

		h: function hydrate() {
			h3.className = "first";
			addListener(select, "change", select_change_handler);
			if (!('locale' in state)) component.root._beforecreate.push(select_change_handler);
			i.className = "icon-chevron-left";
			a.className = "btn submit";
			a.href = "upload";
			i_1.className = "icon-chevron-right icon-white";
			a_1.href = "visualize";
			a_1.className = "submit btn btn-primary";
			a_1.id = "describe-proceed";
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
			insertNode(h4, target, anchor);
			appendNode(text_5, h4);
			insertNode(text_6, target, anchor);
			insertNode(p_1, target, anchor);
			appendNode(text_7, p_1);
			insertNode(text_8, target, anchor);
			insertNode(select, target, anchor);

			for (var i_2 = 0; i_2 < each_blocks.length; i_2 += 1) {
				each_blocks[i_2].m(select, null);
			}

			selectOption(select, state.locale);

			insertNode(text_9, target, anchor);
			insertNode(hr, target, anchor);
			insertNode(text_10, target, anchor);
			insertNode(div, target, anchor);
			appendNode(a, div);
			appendNode(i, a);
			appendNode(text_11, a);
			appendNode(text_12, a);
			appendNode(text_13, div);
			appendNode(a_1, div);
			appendNode(text_14, a_1);
			appendNode(text_15, a_1);
			appendNode(i_1, a_1);
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

			var locales = state.locales;

			if (changed.locales) {
				for (var i_2 = 0; i_2 < locales.length; i_2 += 1) {
					var each_context = assign({}, state, {
						locales: locales,
						locale: locales[i_2],
						locale_index: i_2
					});

					if (each_blocks[i_2]) {
						each_blocks[i_2].p(changed, each_context);
					} else {
						each_blocks[i_2] = create_each_block$2(component, each_context);
						each_blocks[i_2].c();
						each_blocks[i_2].m(select, null);
					}
				}

				for (; i_2 < each_blocks.length; i_2 += 1) {
					each_blocks[i_2].u();
					each_blocks[i_2].d();
				}
				each_blocks.length = locales.length;
			}

			if (!select_updating) selectOption(select, state.locale);
		},

		u: function unmount() {
			detachNode(h3);
			detachNode(text_1);
			detachNode(p);
			detachNode(text_3);
			checkbox._unmount();
			detachNode(text_4);
			detachNode(h4);
			detachNode(text_6);
			detachNode(p_1);
			detachNode(text_8);
			detachNode(select);

			for (var i_2 = 0; i_2 < each_blocks.length; i_2 += 1) {
				each_blocks[i_2].u();
			}

			detachNode(text_9);
			detachNode(hr);
			detachNode(text_10);
			detachNode(div);
		},

		d: function destroy$$1() {
			checkbox.destroy(false);

			destroyEach(each_blocks);

			removeListener(select, "change", select_change_handler);
		}
	};
}

// (87:28) {{#each columns as col}}
function create_each_block_1$1(component, state) {
	var col = state.col, col_index = state.col_index;
	var li, a, i, i_class_value, text, i_1, i_1_class_value, text_1, text_2_value = col.title(), text_2, a_href_value, li_class_value;

	return {
		c: function create() {
			li = createElement("li");
			a = createElement("a");
			i = createElement("i");
			text = createText("\n                                ");
			i_1 = createElement("i");
			text_1 = createText("   ");
			text_2 = createText(text_2_value);
			this.h();
		},

		h: function hydrate() {
			i.className = i_class_value = "fa fa-sort-" + (col.type()=='text'?'alpha':'amount') + "-asc fa-fw" + " svelte-1mhp3v1";
			addListener(i, "click", click_handler$1);

			i._svelte = {
				component: component,
				columns: state.columns,
				col_index: state.col_index
			};

			i_1.className = i_1_class_value = "fa fa-sort-" + (col.type()=='text'?'alpha':'amount') + "-desc fa-fw" + " svelte-1mhp3v1";
			addListener(i_1, "click", click_handler_1);

			i_1._svelte = {
				component: component,
				columns: state.columns,
				col_index: state.col_index
			};

			a.href = a_href_value = "#/" + col.name();
			a.className = "svelte-1mhp3v1";
			addListener(a, "click", click_handler_2);

			a._svelte = {
				component: component,
				columns: state.columns,
				col_index: state.col_index
			};

			li.className = li_class_value = col.name()==state.sortBy?'active':'';
		},

		m: function mount(target, anchor) {
			insertNode(li, target, anchor);
			appendNode(a, li);
			appendNode(i, a);
			appendNode(text, a);
			appendNode(i_1, a);
			appendNode(text_1, a);
			appendNode(text_2, a);
		},

		p: function update(changed, state) {
			col = state.col;
			col_index = state.col_index;
			if ((changed.columns) && i_class_value !== (i_class_value = "fa fa-sort-" + (col.type()=='text'?'alpha':'amount') + "-asc fa-fw" + " svelte-1mhp3v1")) {
				i.className = i_class_value;
			}

			i._svelte.columns = state.columns;
			i._svelte.col_index = state.col_index;

			if ((changed.columns) && i_1_class_value !== (i_1_class_value = "fa fa-sort-" + (col.type()=='text'?'alpha':'amount') + "-desc fa-fw" + " svelte-1mhp3v1")) {
				i_1.className = i_1_class_value;
			}

			i_1._svelte.columns = state.columns;
			i_1._svelte.col_index = state.col_index;

			if ((changed.columns) && text_2_value !== (text_2_value = col.title())) {
				text_2.data = text_2_value;
			}

			if ((changed.columns) && a_href_value !== (a_href_value = "#/" + col.name())) {
				a.href = a_href_value;
			}

			a._svelte.columns = state.columns;
			a._svelte.col_index = state.col_index;

			if ((changed.columns || changed.sortBy) && li_class_value !== (li_class_value = col.name()==state.sortBy?'active':'')) {
				li.className = li_class_value;
			}
		},

		u: function unmount() {
			detachNode(li);
		},

		d: function destroy$$1() {
			removeListener(i, "click", click_handler$1);
			removeListener(i_1, "click", click_handler_1);
			removeListener(a, "click", click_handler_2);
		}
	};
}

// (100:24) {{#if searchResults.length > 0}}
function create_if_block_5(component, state) {
	var div, button, text, button_1;

	function click_handler_3(event) {
		component.nextResult(-1);
	}

	function click_handler_4(event) {
		component.nextResult(+1);
	}

	return {
		c: function create() {
			div = createElement("div");
			button = createElement("button");
			button.innerHTML = "<i class=\"fa fa-chevron-up\"></i>";
			text = createText("\n                          ");
			button_1 = createElement("button");
			button_1.innerHTML = "<i class=\"fa fa-chevron-down\"></i>";
			this.h();
		},

		h: function hydrate() {
			button.className = "btn svelte-1mhp3v1";
			addListener(button, "click", click_handler_3);
			button_1.className = "btn svelte-1mhp3v1";
			addListener(button_1, "click", click_handler_4);
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
			removeListener(button, "click", click_handler_3);
			removeListener(button_1, "click", click_handler_4);
		}
	};
}

// (112:24) {{#if searchResults.length > 0}}
function create_if_block_7(component, state) {
	var text_value = state.searchIndexSafe+1, text, text_1, text_2_value = "of", text_2, text_3, text_4_value = state.searchResults.length, text_4, text_5, text_6_value = "results", text_6;

	return {
		c: function create() {
			text = createText(text_value);
			text_1 = createText("\n                            ");
			text_2 = createText(text_2_value);
			text_3 = createText("\n                            ");
			text_4 = createText(text_4_value);
			text_5 = createText("\n                            ");
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

// (117:41) 
function create_if_block_8(component, state) {
	var text_value = "No matches", text;

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

// (110:20) {{#if search}}
function create_if_block_6(component, state) {
	var div;

	function select_block_type_1(state) {
		if (state.searchResults.length > 0) return create_if_block_7;
		if (state.search) return create_if_block_8;
		return null;
	}

	var current_block_type = select_block_type_1(state);
	var if_block = current_block_type && current_block_type(component, state);

	return {
		c: function create() {
			div = createElement("div");
			if (if_block) if_block.c();
			this.h();
		},

		h: function hydrate() {
			div.className = "results svelte-1mhp3v1";
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
				if_block = current_block_type && current_block_type(component, state);
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

function click_handler$1(event) {
	var component = this._svelte.component;
	var columns = this._svelte.columns, col_index = this._svelte.col_index, col = columns[col_index];
	component.sort(event, col.name(), true);
}

function click_handler_1(event) {
	var component = this._svelte.component;
	var columns = this._svelte.columns, col_index = this._svelte.col_index, col = columns[col_index];
	component.sort(event, col.name(), false);
}

function click_handler_2(event) {
	var component = this._svelte.component;
	var columns = this._svelte.columns, col_index = this._svelte.col_index, col = columns[col_index];
	component.sort(event, col.name(), true);
}

function App(options) {
	this._debugName = '<App>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this.refs = {};
	this._state = assign(data$5(), options.data);
	this._recompute({ searchIndex: 1, searchResults: 1, activeColumn: 1, forceColumnFormat: 1, sortBy: 1, sortDir: 1 }, this._state);
	if (!('searchIndex' in this._state)) console.warn("<App> was created without expected data property 'searchIndex'");
	if (!('searchResults' in this._state)) console.warn("<App> was created without expected data property 'searchResults'");
	if (!('activeColumn' in this._state)) console.warn("<App> was created without expected data property 'activeColumn'");
	if (!('forceColumnFormat' in this._state)) console.warn("<App> was created without expected data property 'forceColumnFormat'");
	if (!('sortBy' in this._state)) console.warn("<App> was created without expected data property 'sortBy'");
	if (!('sortDir' in this._state)) console.warn("<App> was created without expected data property 'sortDir'");
	if (!('customColumn' in this._state)) console.warn("<App> was created without expected data property 'customColumn'");
	if (!('columns' in this._state)) console.warn("<App> was created without expected data property 'columns'");
	if (!('columnFormat' in this._state)) console.warn("<App> was created without expected data property 'columnFormat'");
	if (!('multiSelection' in this._state)) console.warn("<App> was created without expected data property 'multiSelection'");
	if (!('firstRowIsHeader' in this._state)) console.warn("<App> was created without expected data property 'firstRowIsHeader'");
	if (!('locale' in this._state)) console.warn("<App> was created without expected data property 'locale'");
	if (!('locales' in this._state)) console.warn("<App> was created without expected data property 'locales'");
	if (!('search' in this._state)) console.warn("<App> was created without expected data property 'search'");
	if (!('searchIndexSafe' in this._state)) console.warn("<App> was created without expected data property 'searchIndexSafe'");
	if (!('chartData' in this._state)) console.warn("<App> was created without expected data property 'chartData'");
	if (!('transpose' in this._state)) console.warn("<App> was created without expected data property 'transpose'");
	if (!('sorting' in this._state)) console.warn("<App> was created without expected data property 'sorting'");
	if (!('has_changes' in this._state)) console.warn("<App> was created without expected data property 'has_changes'");

	var _oncreate = oncreate$3.bind(this);

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$5(this, this._state);

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

assign(App.prototype, methods$3, protoDev);

App.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('searchIndexSafe' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'searchIndexSafe'");
	if ('customColumn' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'customColumn'");
	if ('columnFormat' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'columnFormat'");
	if ('columns' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'columns'");
	if ('sorting' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'sorting'");
};

App.prototype._recompute = function _recompute(changed, state) {
	if (changed.searchIndex || changed.searchResults) {
		if (this._differs(state.searchIndexSafe, (state.searchIndexSafe = searchIndexSafe(state.searchIndex, state.searchResults)))) changed.searchIndexSafe = true;
	}

	if (changed.activeColumn || changed.forceColumnFormat) {
		if (this._differs(state.customColumn, (state.customColumn = customColumn(state.activeColumn, state.forceColumnFormat)))) changed.customColumn = true;
		if (this._differs(state.columnFormat, (state.columnFormat = columnFormat(state.activeColumn, state.forceColumnFormat)))) changed.columnFormat = true;
	}

	if (changed.activeColumn) {
		if (this._differs(state.columns, (state.columns = columns(state.activeColumn)))) changed.columns = true;
	}

	if (changed.sortBy || changed.sortDir) {
		if (this._differs(state.sorting, (state.sorting = sorting(state.sortBy, state.sortDir)))) changed.sorting = true;
	}
};

function Store(state, options) {
	this._observers = { pre: blankObject(), post: blankObject() };
	this._changeHandlers = [];
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

	get: get,

	observe: observe,

	onchange: function(callback) {
		this._changeHandlers.push(callback);

		var store = this;

		return {
			cancel: function() {
				var index = store._changeHandlers.indexOf(callback);
				if (~index) store._changeHandlers.splice(index, 1);
			}
		};
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

const data$6 = {
    chart: {
        id: ''
    },
    readonly: false,
    chartData: '',
    transpose: false,
    firstRowIsHeader: true,
    skipRows: 0
};

var main = { App, store, data: data$6 };

return main;

})));
