(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('Handsontable')) :
	typeof define === 'function' && define.amd ? define(['Handsontable'], factory) :
	(global['controls/hot'] = factory(global.HOT));
}(this, (function (HOT) { 'use strict';

HOT = HOT && HOT.hasOwnProperty('default') ? HOT['default'] : HOT;

function noop() {}

function assign(tar, src) {
	for (var k in src) { tar[k] = src[k]; }
	return tar;
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

/* @DEPRECATED: plase use @datawrapper/shared instead */

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
    allowed = (((allowed !== undefined ? allowed || '' : defaultAllowed) + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');

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

/**
 * getCellRenderer defines what classes are set on each HOT cell
 */
function getCellRenderer(app, chart, dataset, Handsontable) {
    var colTypeIcons = {
        date: 'fa fa-clock-o'
    };
    function HtmlCellRender(instance, TD, row, col, prop, value, cellProperties) {
        var escaped = purifyHtml(Handsontable.helper.stringify(value));
        TD.innerHTML = escaped; // this is faster than innerHTML. See: https://github.com/warpech/jquery-handsontable/wiki/JavaScript-&-DOM-performance-tips
    }
    return function(instance, td, row, col, prop, value, cellProperties) {
        if (dataset.numColumns() <= col || !dataset.hasColumn(col)) { return; }
        var column = dataset.column(col);
        var ref = app.get();
        var searchResults = ref.searchResults;
        var currentResult = ref.currentResult;
        var activeColumn = ref.activeColumn;
        var colFormat = app.getColumnFormat(column.name());
        row = instance.toPhysicalRow(row);
        if (row > 0) {
            var formatter = chart.columnFormatter(column);
            value = formatter(column.val(row - 1), true);
        }
        if (parseInt(value) < 0) {
            // if row contains negative number
            td.classList.add('negative');
        }
        td.classList.add(column.type() + 'Type');
        td.dataset.column = col;

        if (column.type() === 'text' && value && value.length > 70) {
            value = value.substr(0, 60) + '…';
        }

        if (row === 0) {
            td.classList.add('firstRow');
            if (colTypeIcons[column.type()]) {
                value = '<i class="' + colTypeIcons[column.type()] + '"></i> ' + value;
            }
        } else {
            td.classList.add(row % 2 ? 'oddRow' : 'evenRow');
        }
        if (colFormat.ignore) {
            td.classList.add('ignored');
        }
        if (activeColumn && activeColumn.name() === column.name()) {
            td.classList.add('active');
        }
        var rowPosition = instance.getPlugin('columnSorting').untranslateRow(row);
        searchResults.forEach(function (res) {
            if (res.row === rowPosition && res.col === col) {
                td.classList.add('htSearchResult');
            }
        });
        if (currentResult && currentResult.row === rowPosition && currentResult.col === col) {
            td.classList.add('htCurrentSearchResult');
        }
        if (row > 0 && !column.type(true).isValid(column.val(row - 1))) {
            td.classList.add('parsingError');
        }
        if (cellProperties.readOnly) { td.classList.add('readOnly'); }

        if (chart.dataCellChanged(col, row)) {
            td.classList.add('changed');
        }
        HtmlCellRender(instance, td, row, col, prop, value, cellProperties);
        // Reflect.apply(HtmlCellRender, this, arguments);
    };
}

/* @DEPRECATED: plase use @datawrapper/shared instead */

function clone(o) {
    if (!o || typeof o !== 'object') { return o; }
    try {
        return JSON.parse(JSON.stringify(o));
    } catch (e) {
        return o;
    }
}

/* controls/hot/Handsontable.html generated by Svelte v1.64.0 */

var app = null;

function searchResults(ref) {
    var search = ref.search;
    var hot = ref.hot;

    if (!hot || !search) { return []; }
    return hot.search.query(search);
}
function currentResult(ref) {
    var searchResults = ref.searchResults;
    var searchIndex = ref.searchIndex;

    if (!searchResults || !searchResults.length) { return null; }
    var l = searchResults.length;
    if (searchIndex < 0 || searchIndex >= l) {
        while (searchIndex < 0) { searchIndex += l; }
        if (searchIndex > l) { searchIndex %= l; }
    }
    return searchResults[searchIndex];
}
function data() {
    return {
        hot: null,
        data: '',
        readonly: false,
        skipRows: 0,
        firstRowIsHeader: true,
        fixedColumnsLeft: 0,
        searchIndex: 0,
        sortBy: '-',
        transpose: false,
        activeColumn: null,
        search: '',
        searchResults: []
    };
}
var methods = {
    render: function render() {
        var ref = this.get();
        var hot = ref.hot;
        hot.render();
    },
    update: function update() {
        var this$1 = this;

        var ref = this.get();
        var data = ref.data;
        var transpose = ref.transpose;
        var firstRowIsHeader = ref.firstRowIsHeader;
        var skipRows = ref.skipRows;
        var hot = ref.hot;

        if (!data) { return; }

        // get chart
        var chart = this.store.get('dw_chart');

        // pass dataset through chart to apply changes and computed columns
        var ds = chart
            .dataset(
                dw.datasource
                    .delimited({
                        csv: data,
                        transpose: transpose,
                        firstRowIsHeader: firstRowIsHeader,
                        skipRows: skipRows
                    })
                    .parse()
            )
            .dataset();

        this.set({ columnOrder: ds.columnOrder() });

        // construct HoT data array
        var hotData = [[]];
        ds.eachColumn(function (c) { return hotData[0].push(c.title()); });

        ds.eachRow(function (r) {
            var row = [];
            ds.eachColumn(function (col) { return row.push(col.raw(r)); });
            hotData.push(row);
        });

        // pass data to hot
        hot.loadData(hotData);

        var cellRenderer = getCellRenderer(this, chart, ds, HOT, {});

        hot.updateSettings({
            cells: function (row, col) {
                var ref = this$1.get();
                var readonly = ref.readonly;
                return {
                    readOnly: readonly || (ds.hasColumn(col) && ds.column(col).isComputed && row === 0),
                    renderer: cellRenderer
                };
            },
            manualColumnMove: []
        });

        this.set({ ds: ds });
        this.set({ has_changes: clone(chart.get('metadata.data.changes', [])).length > 0 });

        HOT.hooks.once('afterRender', function () { return this$1.initCustomEvents(); });
        hot.render();
    },
    dataChanged: function dataChanged(cells) {
        var this$1 = this;

        var ref = this.get();
        var hot = ref.hot;
        var changed = false;
        cells.forEach(function (ref) {
            var row = ref[0];
            var col = ref[1];
            var oldValue = ref[2];
            var newValue = ref[3];

            if (oldValue !== newValue) {
                var chart = this$1.store.get('dw_chart');
                var ref$1 = this$1.get();
                var transpose = ref$1.transpose;
                var changes = clone(chart.get('metadata.data.changes', []));
                row = hot.toPhysicalRow(row);
                col = chart.dataset().columnOrder()[col];
                if (transpose) {
                    // swap row and col
                    var tmp = row;
                    row = col;
                    col = tmp;
                }
                // store new change
                changes.push({
                    column: col,
                    row: row,
                    value: newValue,
                    time: new Date().getTime()
                });
                chart.set('metadata.data.changes', changes);
                changed = true;
            }
        });
        if (changed) {
            setTimeout(function () {
                this$1.update();
                chart.save();
            }, 100);
        }
    },
    columnMoved: function columnMoved(srcColumns, tgtIndex) {
        var this$1 = this;

        var ref = this.get();
        var hot = ref.hot;
        if (!srcColumns.length) { return; }
        var ref$1 = this.get();
        var columnOrder = ref$1.columnOrder;
        var newOrder = columnOrder.slice(0);
        var after = columnOrder[tgtIndex];
        var elements = newOrder.splice(srcColumns[0], srcColumns.length);
        var insertAt = after === undefined ? newOrder.length : after ? newOrder.indexOf(after) : 0;
        newOrder.splice.apply(newOrder, [ insertAt, 0 ].concat( elements ));
        this.store.get('dw_chart').set('metadata.data.column-order', newOrder.slice(0));
        this.set({ columnOrder: newOrder });
        // update selection
        HOT.hooks.once('afterRender', function () {
            setTimeout(function () {
                this$1.fire('resetSort');
                hot.selectCell(0, insertAt, hot.countRows() - 1, insertAt + elements.length - 1);
            }, 10);
        });
        this.update();
    },
    updateHeight: function updateHeight() {
        var h = document.querySelector('.ht_master.handsontable .wtHolder .wtHider').getBoundingClientRect().height;
        this.refs.hot.style.height = Math.min(500, h + 10) + 'px';
    },
    checkRange: function checkRange(r, c, r2, c2) {
        // check if
        // 1. only a single column is selected, and
        // 2. the range starts at the first row, and
        // 3. the range extends through he last row
        var ref = this.get();
        var hot = ref.hot;
        var ref$1 = this.get();
        var ds = ref$1.ds;

        if (c === c2 && r === 0 && r2 === hot.countRows() - 1) {
            // const chart = this.store.get('dw_chart');
            // this.set({activeColumn: chart.dataset().column(c)});
            return;
        }
        if (c !== c2 && r === 0 && r2 === hot.countRows() - 1) {
            var sel = [];
            for (var i = Math.min(c, c2); i <= Math.max(c, c2); i++) {
                sel.push(+document.querySelector(("#data-preview .htCore tbody tr:first-child td:nth-child(" + (i + 2) + ")")).dataset.column);
            }
            this.set({ multiSelection: sel.map(function (i) { return ds.column(i); }), activeColumn: null });
            return;
        }
        this.set({ activeColumn: null, multiSelection: false });
    },
    initCustomEvents: function initCustomEvents() {
        var this$1 = this;

        // wait a bit to make sure HoT is rendered
        setTimeout(function () {
            // catch click events on A,B,C,D... header row
            this$1.refs.hot.querySelectorAll('.htCore thead th:first-child').forEach(function (th) {
                th.removeEventListener('click', topLeftCornerClick);
                th.addEventListener('click', topLeftCornerClick);
            });
            // const cellHeaderClickHandler = cellHeaderClick(app);
            this$1.refs.hot.querySelectorAll('.htCore thead th+th').forEach(function (th) {
                th.removeEventListener('click', cellHeaderClick);
                th.addEventListener('click', cellHeaderClick);
            });
        }, 500);
    },

    getColumnFormat: function getColumnFormat(name) {
        var chart = this.store.get('dw_chart');
        var colFormats = chart.get('metadata.data.column-format', {});
        return colFormats[name] || { type: 'auto', ignore: false };
    }
};

function oncreate() {
    var this$1 = this;

    app = this;
    HOT.hooks.once('afterRender', function () { return this$1.initCustomEvents(); });

    window.addEventListener('keyup', function (evt) {
        var ref = this$1.get();
        var activeColumn = ref.activeColumn;
        var ds = ref.ds;
        if (!activeColumn) { return; }

        if (evt.target.tagName.toLowerCase() === 'input' || evt.target.tagName.toLowerCase() === 'textarea') { return; }

        if (evt.key === 'ArrowRight' || evt.key === 'ArrowLeft') {
            evt.preventDefault();
            evt.stopPropagation();
            var currentIndex = ds.indexOf(activeColumn.name());
            if (evt.key === 'ArrowRight') {
                // select next column
                this$1.set({ activeColumn: ds.column((currentIndex + 1) % ds.numColumns()) });
            } else {
                // select prev column
                this$1.set({
                    activeColumn: ds.column((currentIndex - 1 + ds.numColumns()) % ds.numColumns())
                });
            }
        }
    });

    var chart = this.store.get('dw_chart');

    var hot = new HOT(this.refs.hot, {
        data: [],
        rowHeaders: function (i) {
            var ti = hot.getPlugin('ColumnSorting').translateRow(i);
            return ti + 1;
        },
        colHeaders: true,
        fixedRowsTop: 1,
        fixedColumnsLeft: this.get('fixedColumnsLeft'),
        filters: true,
        dropdownMenu: true,
        startRows: 13,
        startCols: 8,
        fillHandle: false,
        stretchH: 'all',
        height: 500,
        manualColumnMove: true,
        selectionMode: 'range',
        autoColumnSize: { useHeaders: true, syncLimit: 5 },
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
                    if (a[0] === 0) { return -1; }
                    // replace with values
                    a[1] = column.val(a[0] - 1);
                    b[1] = column.val(b[0] - 1);
                    if (colType === 'number') {
                        // sort NaNs at bottom
                        if (isNaN(a[1])) { a[1] = !sortOrder ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY; }
                        if (isNaN(b[1])) { b[1] = !sortOrder ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY; }
                    }
                    if (colType === 'date') {
                        if (typeof a[1] === 'string') { a[1] = new Date(110, 0, 1); }
                        if (typeof b[1] === 'string') { b[1] = new Date(110, 0, 1); }
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
            return function (a, b) { return a[0] - b[0]; };
        },
        afterGetColHeader: function (col, th) {
            var ref = this$1.get();
            var activeColumn = ref.activeColumn;
            var ds = ref.ds;
            if (!ds || !ds.hasColumn(col)) { return; }
            if ((col === 0 || col) && activeColumn && ds.column(col).name() === activeColumn.name()) {
                th.classList.add('selected');
            }

            if (col === 0 || col) {
                if (this$1.getColumnFormat(ds.column(col).name()).ignore) {
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
    this.set({ hot: hot });

    HOT.hooks.add('afterSetDataAtCell', function (a) { return this$1.dataChanged(a); });
    HOT.hooks.add('afterColumnMove', function (a, b) { return this$1.columnMoved(a, b); });
    HOT.hooks.add('afterRender', function () { return this$1.updateHeight(); });
    HOT.hooks.add('afterSelection', function (r, c, r2, c2) { return this$1.checkRange(r, c, r2, c2); });
}
function onstate(ref) {
    var changed = ref.changed;
    var current = ref.current;
    var previous = ref.previous;

    var hot = current.hot;
    if (!hot) { return; }

    if (changed.data) {
        this.update();
    }
    if (changed.firstRowIsHeader && previous && previous.firstRowIsHeader !== undefined) {
        this.update();
    }
    if (changed.hot) {
        this.update();
    }
    if (changed.search && previous) {
        this.set({ searchIndex: 0 });
    }

    if (changed.searchResults) {
        hot.render();
    }
    if (changed.currentResult && current.currentResult) {
        hot.render();
        var res = current.currentResult;
        hot.scrollViewportTo(res.row, res.col);
        setTimeout(function () {
            // one more time
            hot.scrollViewportTo(res.row, res.col);
        }, 100);
    }
    if (changed.activeColumn) {
        setTimeout(function () { return hot.render(); }, 10);
    }
    if (changed.fixedColumnsLeft) {
        hot.updateSettings({ fixedColumnsLeft: current.fixedColumnsLeft });
    }
    if (changed.sorting) {
        hot.sort(chart.dataset().indexOf(current.sorting.sortBy), current.sorting.sortDir);
    }
}
function cellHeaderClick(evt) {
    var th = this;
    // reset the HoT selection
    // find out which data column we're in
    var k = th.parentNode.children.length;
    var thIndex = -1;
    // (stupid HTMLCollection has no indexOf)
    for (var i = 0; i < k; i++) {
        if (th.parentNode.children.item(i) === th) {
            thIndex = i;
            break;
        }
    }
    // find column index
    var colIndex = +app.refs.hot.querySelector((".htCore tbody tr:first-child td:nth-child(" + (thIndex + 1) + ")")).dataset.column;
    var chart = app.store.get('dw_chart');
    var ref = app.get();
    var activeColumn = ref.activeColumn;
    var hot = ref.hot;
    if (chart.dataset().hasColumn(colIndex)) {
        var newActive = chart.dataset().column(+colIndex);
        // set active column (or unset if it's already set)
        if (activeColumn && activeColumn.name() === newActive.name()) {
            evt.target.parentNode.classList.remove('selected');
            app.set({ activeColumn: false });
            hot.deselectCell();
        } else {
            evt.target.parentNode.classList.add('selected');
            app.set({ activeColumn: newActive });
        }
    }
}

function topLeftCornerClick(evt) {
    evt.preventDefault();
    var ref = app.get();
    var transpose = ref.transpose;
    app.set({ transpose: !transpose });
    app.update();
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
			if (component.refs.hot === div) { component.refs.hot = null; }
		}
	};
}

function Handsontable(options) {
	this._debugName = '<Handsontable>';
	if (!options || (!options.target && !options.root)) { throw new Error("'target' is a required option"); }
	init(this, options);
	this.refs = {};
	this._state = assign(data(), options.data);
	this._recompute({ search: 1, hot: 1, searchResults: 1, searchIndex: 1 }, this._state);

	if (!('searchIndex' in this._state)) { console.warn("<Handsontable> was created without expected data property 'searchIndex'"); }
	if (!('search' in this._state)) { console.warn("<Handsontable> was created without expected data property 'search'"); }
	if (!('hot' in this._state)) { console.warn("<Handsontable> was created without expected data property 'hot'"); }

	this._handlers.state = [onstate];

	var self = this;
	var _oncreate = function() {
		var changed = { searchResults: 1, searchIndex: 1, search: 1, hot: 1 };
		onstate.call(self, { changed: changed, current: self._state });
		oncreate.call(self);
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

assign(Handsontable.prototype, protoDev);
assign(Handsontable.prototype, methods);

Handsontable.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('searchResults' in newState && !this._updatingReadonlyProperty) { throw new Error("<Handsontable>: Cannot set read-only property 'searchResults'"); }
	if ('currentResult' in newState && !this._updatingReadonlyProperty) { throw new Error("<Handsontable>: Cannot set read-only property 'currentResult'"); }
};

Handsontable.prototype._recompute = function _recompute(changed, state) {
	if (changed.search || changed.hot) {
		if (this._differs(state.searchResults, (state.searchResults = searchResults(state)))) { changed.searchResults = true; }
	}

	if (changed.searchResults || changed.searchIndex) {
		if (this._differs(state.currentResult, (state.currentResult = currentResult(state)))) { changed.currentResult = true; }
	}
};

var main = { Handsontable: Handsontable };

return main;

})));
//# sourceMappingURL=hot.js.map
