(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('Handsontable')) :
	typeof define === 'function' && define.amd ? define(['Handsontable'], factory) :
	(global = global || self, global['describe/hot'] = factory(global.HOT));
}(this, (function (HOT) { 'use strict';

	HOT = HOT && Object.prototype.hasOwnProperty.call(HOT, 'default') ? HOT['default'] : HOT;

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

	function insert(target, node, anchor) {
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

	const TAGS = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
	const COMMENTS_AND_PHP_TAGS = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
	const defaultAllowed = '<a><span><b><br><br/><i><strong><sup><sub><strike><u><em><tt>';

	/**
	 * Remove all non-whitelisted html tags from the given string
	 *
	 * @exports purifyHTML
	 * @kind function
	 *
	 * @param {string} input - dirty html input
	 * @param {string} allowed - list of allowed tags, defaults to `<a><b><br><br/><i><strong><sup><sub><strike><u><em><tt>`
	 * @return {string} - the cleaned html output
	 */
	function purifyHTML(input, allowed) {
	    /*
	     * written by Kevin van Zonneveld et.al.
	     * taken from https://github.com/kvz/phpjs/blob/master/functions/strings/strip_tags.js
	     */
	    if (input === null) return null;
	    if (input === undefined) return undefined;
	    input = String(input);
	    // strip tags
	    if (input.indexOf('<') < 0 || input.indexOf('>') < 0) {
	        return input;
	    }
	    input = stripTags(input, allowed);
	    // remove all event attributes
	    if (typeof document === 'undefined') return input;
	    var d = document.createElement('div');
	    d.innerHTML = input;
	    var sel = d.querySelectorAll('*');
	    for (var i = 0; i < sel.length; i++) {
	        if (sel[i].nodeName.toLowerCase() === 'a') {
	            // special treatment for <a> elements
	            if (sel[i].getAttribute('target') !== '_self') sel[i].setAttribute('target', '_blank');
	            sel[i].setAttribute('rel', 'nofollow noopener noreferrer');
	            if (
	                sel[i].getAttribute('href') &&
	                sel[i]
	                    .getAttribute('href')
	                    .trim()
	                    .startsWith('javascript:')
	            ) {
	                // remove entire href to be safe
	                sel[i].setAttribute('href', '');
	            }
	        }
	        const removeAttrs = [];
	        for (var j = 0; j < sel[i].attributes.length; j++) {
	            var attrib = sel[i].attributes[j];
	            if (attrib.specified) {
	                if (attrib.name.substr(0, 2) === 'on') removeAttrs.push(attrib.name);
	            }
	        }
	        removeAttrs.forEach(attr => sel[i].removeAttribute(attr));
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

	/**
	 * getCellRenderer defines what classes are set on each HOT cell
	 */
	function getCellRenderer (app, chart, dataset, Handsontable) {
	    const colTypeIcons = {
	        date: 'fa fa-clock-o'
	    };
	    function HtmlCellRender(instance, TD, row, col, prop, value, cellProperties) {
	        var escaped = purifyHTML(Handsontable.helper.stringify(value));
	        TD.innerHTML = escaped; // this is faster than innerHTML. See: https://github.com/warpech/jquery-handsontable/wiki/JavaScript-&-DOM-performance-tips
	    }
	    return function (instance, td, row, col, prop, value, cellProperties) {
	        if (dataset.numColumns() <= col || !dataset.hasColumn(col)) return;
	        const column = dataset.column(col);
	        const { searchResults, currentResult, activeColumn } = app.get();
	        const colFormat = app.getColumnFormat(column.name());
	        row = instance.toPhysicalRow(row);
	        if (row > 0) {
	            var formatter = chart.columnFormatter(column);
	            value =
	                column.val(row - 1) === null || column.val(row - 1) === ''
	                    ? '–'
	                    : formatter(column.val(row - 1), true);
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
	        const rowPosition = Handsontable.hooks.run(instance, 'modifyRow', row);
	        // const rowPosition = row; // instance.getPlugin('columnSorting').untranslateRow(row);
	        searchResults.forEach(res => {
	            if (res.row === rowPosition && res.col === col) {
	                td.classList.add('htSearchResult');
	            }
	        });
	        if (currentResult && currentResult.row === rowPosition && currentResult.col === col) {
	            td.classList.add('htCurrentSearchResult');
	        }
	        if (
	            row > 0 &&
	            !column.type(true).isValid(column.val(row - 1)) &&
	            column.val(row - 1) !== null &&
	            column.val(row - 1) !== ''
	        ) {
	            td.classList.add('parsingError');
	        }
	        if (row > 0 && (column.val(row - 1) === null || column.val(row - 1) === '')) {
	            td.classList.add('noData');
	        }
	        if (
	            column.isComputed &&
	            column.errors.length &&
	            column.errors.find(err => err.row === 'all' || err.row === row - 1)
	        ) {
	            td.classList.add('parsingError');
	        }
	        if (cellProperties.readOnly) td.classList.add('readOnly');

	        if (chart.dataCellChanged(col, row)) {
	            td.classList.add('changed');
	        }
	        HtmlCellRender(instance, td, row, col, prop, value);
	        // Reflect.apply(HtmlCellRender, this, arguments);
	    };
	}

	/**
	 * Clones an object
	 *
	 * @exports clone
	 * @kind function
	 *
	 * @param {*} object - the thing that should be cloned
	 * @returns {*} - the cloned thing
	 */
	function clone(o) {
	    if (!o || typeof o !== 'object') return o;
	    try {
	        return JSON.parse(JSON.stringify(o));
	    } catch (e) {
	        return o;
	    }
	}

	/* describe/hot/Handsontable.html generated by Svelte v2.16.1 */



	let app = null;
	let searchTimer = null;

	function currentResult({ searchResults, searchIndex }) {
	    if (!searchResults || !searchResults.length) return null;
	    const l = searchResults.length;
	    if (searchIndex < 0 || searchIndex >= l) {
	        while (searchIndex < 0) searchIndex += l;
	        if (searchIndex > l) searchIndex %= l;
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
	    render() {
	        const { hot } = this.get();
	        hot.render();
	    },
	    doSearch() {
	        const { hot, search } = this.get();
	        clearTimeout(searchTimer);
	        searchTimer = setTimeout(() => {
	            if (!hot || !search) {
	                this.set({ searchResults: [] });
	            } else {
	                const searchPlugin = hot.getPlugin('search');
	                const searchResults = searchPlugin.query(search);
	                this.set({ searchResults });
	            }
	        }, 300);
	    },
	    update() {
	        const { data, transpose, firstRowIsHeader, skipRows, hot } = this.get();

	        if (!data) return;

	        // get chart
	        const { dw_chart } = this.store.get();

	        // pass dataset through chart to apply changes and computed columns
	        const ds = dw_chart
	            .dataset(
	                dw.datasource
	                    .delimited({
	                        csv: data,
	                        transpose,
	                        firstRowIsHeader,
	                        skipRows
	                    })
	                    .parse()
	            )
	            .dataset();

	        this.set({ columnOrder: ds.columnOrder() });

	        // construct HoT data array
	        const hotData = [[]];
	        ds.eachColumn(c => hotData[0].push(c.title()));

	        ds.eachRow(r => {
	            const row = [];
	            ds.eachColumn(col => row.push(col.raw(r)));
	            hotData.push(row);
	        });

	        // pass data to hot
	        hot.loadData(hotData);

	        const cellRenderer = getCellRenderer(this, dw_chart, ds, HOT);

	        hot.updateSettings({
	            cells: (row, col) => {
	                const { readonly } = this.get();
	                return {
	                    readOnly:
	                        readonly ||
	                        (ds.hasColumn(col) && ds.column(col).isComputed && row === 0),
	                    renderer: cellRenderer
	                };
	            },
	            manualColumnMove: []
	        });

	        this.set({ ds });
	        this.set({ has_changes: clone(chart.get('metadata.data.changes', [])).length > 0 });

	        HOT.hooks.once('afterRender', () => this.initCustomEvents());
	        HOT.hooks.once('afterRender', () => this.fire('afterRender'));
	        hot.render();
	    },
	    dataChanged(cells) {
	        const { hot } = this.get();
	        let changed = false;
	        cells.forEach(([row, col, oldValue, newValue]) => {
	            if (oldValue !== newValue) {
	                const chart = this.store.get().dw_chart;
	                const { transpose } = this.get();
	                const changes = clone(chart.get('metadata.data.changes', []));
	                row = hot.toPhysicalRow(row);
	                col = chart.dataset().columnOrder()[col];
	                if (transpose) {
	                    // swap row and col
	                    const tmp = row;
	                    row = col;
	                    col = tmp;
	                }
	                // store new change
	                changes.push({
	                    column: col,
	                    row,
	                    value: newValue,
	                    previous: oldValue,
	                    time: new Date().getTime()
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
	    columnMoved(srcColumns, tgtIndex) {
	        const { hot } = this.get();
	        if (!srcColumns.length) return;
	        const { columnOrder } = this.get();
	        const newOrder = columnOrder.slice(0);
	        const after = columnOrder[tgtIndex];
	        const elements = newOrder.splice(srcColumns[0], srcColumns.length);
	        const insertAt =
	            after === undefined ? newOrder.length : after ? newOrder.indexOf(after) : 0;
	        newOrder.splice(insertAt, 0, ...elements);
	        this.store.get().dw_chart.set('metadata.data.column-order', newOrder.slice(0));
	        this.set({ columnOrder: newOrder });
	        // update selection
	        HOT.hooks.once('afterRender', () => {
	            setTimeout(() => {
	                this.fire('resetSort');
	                hot.selectCell(
	                    0,
	                    insertAt,
	                    hot.countRows() - 1,
	                    insertAt + elements.length - 1
	                );
	            }, 10);
	        });
	        this.update();
	    },
	    updateHeight() {
	        const h = document
	            .querySelector('.ht_master.handsontable .wtHolder .wtHider')
	            .getBoundingClientRect().height;
	        this.refs.hot.style.height = Math.min(500, h + 10) + 'px';
	    },
	    checkRange(r, c, r2, c2) {
	        // check if
	        // 1. only a single column is selected, and
	        // 2. the range starts at the first row, and
	        // 3. the range extends through he last row
	        const { hot } = this.get();
	        const { ds } = this.get();

	        if (c === c2 && r === 0 && r2 === hot.countRows() - 1) {
	            // const chart = this.store.get('dw_chart');
	            // this.set({activeColumn: chart.dataset().column(c)});
	            return;
	        }
	        if (c !== c2 && r === 0 && r2 === hot.countRows() - 1) {
	            const sel = [];
	            for (let i = Math.min(c, c2); i <= Math.max(c, c2); i++) {
	                sel.push(
	                    +document.querySelector(
	                        `#data-preview .htCore tbody tr:first-child td:nth-child(${i + 2})`
	                    ).dataset.column
	                );
	            }
	            this.set({ multiSelection: sel.map(i => ds.column(i)), activeColumn: null });
	            return;
	        }
	        this.set({ activeColumn: null, multiSelection: false });
	    },
	    initCustomEvents() {
	        // wait a bit to make sure HoT is rendered
	        setTimeout(() => {
	            // catch click events on A,B,C,D... header row
	            this.refs.hot.querySelectorAll('.htCore thead th:first-child').forEach(th => {
	                th.removeEventListener('click', topLeftCornerClick);
	                th.addEventListener('click', topLeftCornerClick);
	            });
	            // const cellHeaderClickHandler = cellHeaderClick(app);
	            this.refs.hot.querySelectorAll('.htCore thead th+th').forEach(th => {
	                th.removeEventListener('click', cellHeaderClick);
	                th.addEventListener('click', cellHeaderClick);
	            });
	        }, 500);
	    },

	    getColumnFormat(name) {
	        const { dw_chart } = this.store.get();
	        const colFormats = dw_chart.get('metadata.data.column-format', {});
	        return colFormats[name] || { type: 'auto', ignore: false };
	    }
	};

	function oncreate() {
	    app = this;
	    HOT.hooks.once('afterRender', () => this.initCustomEvents());

	    window.addEventListener('keyup', evt => {
	        const { activeColumn, ds } = this.get();
	        if (!activeColumn) return;

	        if (
	            evt.target.tagName.toLowerCase() === 'input' ||
	            evt.target.tagName.toLowerCase() === 'textarea'
	        )
	            return;

	        if (evt.key === 'ArrowRight' || evt.key === 'ArrowLeft') {
	            evt.preventDefault();
	            evt.stopPropagation();
	            const currentIndex = ds.indexOf(activeColumn.name());
	            if (evt.key === 'ArrowRight') {
	                // select next column
	                this.set({ activeColumn: ds.column((currentIndex + 1) % ds.numColumns()) });
	            } else {
	                // select prev column
	                this.set({
	                    activeColumn: ds.column(
	                        (currentIndex - 1 + ds.numColumns()) % ds.numColumns()
	                    )
	                });
	            }
	        }
	    });

	    const { dw_chart } = this.store.get();
	    const hot = new HOT(this.refs.hot, {
	        data: [],
	        rowHeaders: i => {
	            const ti = HOT.hooks.run(hot, 'modifyRow', i);
	            // const ti = hot.getPlugin('ColumnSorting').translateRow(i);
	            return ti + 1;
	        },
	        colHeaders: true,
	        fixedRowsTop: 1,
	        fixedColumnsLeft: this.get().fixedColumnsLeft,
	        filters: true,
	        // dropdownMenu: true,
	        startRows: 13,
	        startCols: 8,
	        fillHandle: false,
	        stretchH: 'all',
	        height: 500,
	        manualColumnMove: true,
	        selectionMode: 'range',
	        autoColumnSize: { useHeaders: true, syncLimit: 5 },

	        // // sorting
	        sortIndicator: true,
	        columnSorting: true,
	        sortFunction: function (sortOrder, columnMeta) {
	            if (columnMeta.col > -1) {
	                const column = dw_chart.dataset().column(columnMeta.col);
	                const colType = column.type();
	                return (a, b) => {
	                    if (a[0] === 0) return -1;
	                    // replace with values
	                    a[1] = column.val(a[0] - 1);
	                    b[1] = column.val(b[0] - 1);
	                    if (colType === 'number') {
	                        // sort NaNs at bottom
	                        if (isNaN(a[1]))
	                            a[1] = !sortOrder
	                                ? Number.NEGATIVE_INFINITY
	                                : Number.POSITIVE_INFINITY;
	                        if (isNaN(b[1]))
	                            b[1] = !sortOrder
	                                ? Number.NEGATIVE_INFINITY
	                                : Number.POSITIVE_INFINITY;
	                    }
	                    if (colType === 'date') {
	                        if (typeof a[1] === 'string') a[1] = new Date(110, 0, 1);
	                        if (typeof b[1] === 'string') b[1] = new Date(110, 0, 1);
	                    }
	                    return (
	                        (sortOrder === 'desc' ? -1 : 1) *
	                        (a[1] > b[1] ? 1 : a[1] < b[1] ? -1 : 0)
	                    );
	                };
	            }
	            return (a, b) => a[0] - b[0];
	        },
	        afterGetColHeader: (col, th) => {
	            const { activeColumn, ds } = this.get();
	            if (!ds || !ds.hasColumn(col)) return;
	            if (
	                (col === 0 || col) &&
	                activeColumn &&
	                ds.column(col).name() === activeColumn.name()
	            ) {
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
	        // // search
	        search: 'search'
	    });

	    window.HT = hot;
	    this.set({ hot });

	    HOT.hooks.add('afterSetDataAtCell', a => this.dataChanged(a));
	    HOT.hooks.add('afterColumnMove', (a, b) => this.columnMoved(a, b));
	    HOT.hooks.add('afterRender', () => this.updateHeight());
	    HOT.hooks.add('afterSelection', (r, c, r2, c2) => this.checkRange(r, c, r2, c2));
	}
	function onstate({ changed, current, previous }) {
	    const hot = current.hot;
	    if (!hot) return;

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
	        this.doSearch();
	        this.set({ searchIndex: 0 });
	    }

	    if (changed.searchResults) {
	        hot.render();
	    }
	    if (changed.currentResult && current.currentResult) {
	        hot.render();
	        const res = current.currentResult;
	        hot.scrollViewportTo(res.row, res.col);
	        setTimeout(() => {
	            // one more time
	            hot.scrollViewportTo(res.row, res.col);
	        }, 100);
	    }
	    if (changed.activeColumn) {
	        setTimeout(() => hot.render(), 10);
	    }
	    if (changed.fixedColumnsLeft) {
	        hot.updateSettings({ fixedColumnsLeft: current.fixedColumnsLeft });
	    }
	    if (changed.sorting) {
	        hot.getPlugin('columnSorting').sort(
	            chart.dataset().indexOf(current.sorting.sortBy),
	            current.sorting.sortDir ? 'asc' : 'desc'
	        );
	    }
	}
	function cellHeaderClick(evt) {
	    const th = this;
	    // reset the HoT selection
	    // find out which data column we're in
	    const k = th.parentNode.children.length;
	    let thIndex = -1;
	    // (stupid HTMLCollection has no indexOf)
	    for (let i = 0; i < k; i++) {
	        if (th.parentNode.children.item(i) === th) {
	            thIndex = i;
	            break;
	        }
	    }
	    // find column index
	    const colIndex = +app.refs.hot.querySelector(
	        `.htCore tbody tr:first-child td:nth-child(${thIndex + 1})`
	    ).dataset.column;
	    const { dw_chart } = app.store.get();
	    const { activeColumn, hot } = app.get();
	    if (dw_chart.dataset().hasColumn(colIndex)) {
	        const newActive = dw_chart.dataset().column(+colIndex);
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
	    const { transpose } = app.get();
	    app.set({ transpose: !transpose });
	    app.update();
	}

	const file = "describe/hot/Handsontable.html";

	function create_main_fragment(component, ctx) {
		var div;

		return {
			c: function create() {
				div = createElement("div");
				div.id = "data-preview";
				addLoc(div, file, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				component.refs.hot = div;
			},

			p: noop,

			d: function destroy(detach) {
				if (detach) {
					detachNode(div);
				}

				if (component.refs.hot === div) component.refs.hot = null;
			}
		};
	}

	function Handsontable(options) {
		this._debugName = '<Handsontable>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data(), options.data);

		this._recompute({ searchResults: 1, searchIndex: 1 }, this._state);
		if (!('searchResults' in this._state)) console.warn("<Handsontable> was created without expected data property 'searchResults'");
		if (!('searchIndex' in this._state)) console.warn("<Handsontable> was created without expected data property 'searchIndex'");
		this._intro = true;

		this._handlers.state = [onstate];

		onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

		this._fragment = create_main_fragment(this, this._state);

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

	assign(Handsontable.prototype, protoDev);
	assign(Handsontable.prototype, methods);

	Handsontable.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('currentResult' in newState && !this._updatingReadonlyProperty) throw new Error("<Handsontable>: Cannot set read-only property 'currentResult'");
	};

	Handsontable.prototype._recompute = function _recompute(changed, state) {
		if (changed.searchResults || changed.searchIndex) {
			if (this._differs(state.currentResult, (state.currentResult = currentResult(state)))) changed.currentResult = true;
		}
	};

	var main = { Handsontable };

	return main;

})));
//# sourceMappingURL=hot.js.map
