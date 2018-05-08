(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('Handsontable')) :
	typeof define === 'function' && define.amd ? define(['Handsontable'], factory) :
	(global['controls/hot'] = factory(null));
}(this, (function (HOT) { 'use strict';

	HOT = HOT && HOT.hasOwnProperty('default') ? HOT['default'] : HOT;

	function noop() {}

	function assign(tar, src) {
		for (var k in src) tar[k] = src[k];
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

	/* controls/hot/Handsontable.html generated by Svelte v1.64.0 */

	let app = null;

	function currentResult({ searchResults, searchIndex }) {
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
	        const {hot} = this.get();
	        hot.render();
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
	                col = chart.dataset().columnOrder()[col];
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
	        const insertAt = after === undefined ? newOrder.length : after ? newOrder.indexOf(after) : 0;
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
	            this.refs.hot.querySelectorAll('.htCore thead th:first-child').forEach(th => {
	                th.removeEventListener('click', topLeftCornerClick);
	                th.addEventListener('click', topLeftCornerClick);
	            });
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

	    window.addEventListener('keyup', (evt) => {
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

	    this.observe('search', (query, oldquery) => {
	        if (query != oldquery) this.set({searchIndex:0});
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

	function topLeftCornerClick(evt) {
	    evt.preventDefault();
	    const {transpose} = app.get();
	    app.set({transpose: !transpose});
	    app.update();
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

		var self = this;
		var _oncreate = function() {
			var changed = { searchResults: 1, searchIndex: 1 };
			oncreate.call(self);
			self.fire("update", { changed: changed, current: self._state });
		};

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

	assign(Handsontable_1.prototype, protoDev);
	assign(Handsontable_1.prototype, methods);

	Handsontable_1.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('currentResult' in newState && !this._updatingReadonlyProperty) throw new Error("<Handsontable_1>: Cannot set read-only property 'currentResult'");
	};

	Handsontable_1.prototype._recompute = function _recompute(changed, state) {
		if (changed.searchResults || changed.searchIndex) {
			if (this._differs(state.currentResult, (state.currentResult = currentResult(state)))) changed.currentResult = true;
		}
	};

	var main = { Handsontable: Handsontable_1 };

	return main;

})));
