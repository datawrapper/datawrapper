(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('Handsontable')) :
  typeof define === 'function' && define.amd ? define(['Handsontable'], factory) :
  (global = global || self, global['describe/hot'] = factory(global.HOT));
}(this, function (HOT) { 'use strict';

  HOT = HOT && HOT.hasOwnProperty('default') ? HOT['default'] : HOT;

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }

  var arrayLikeToArray = _arrayLikeToArray;

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return arrayLikeToArray(arr);
  }

  var arrayWithoutHoles = _arrayWithoutHoles;

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  var iterableToArray = _iterableToArray;

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
  }

  var unsupportedIterableToArray = _unsupportedIterableToArray;

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var nonIterableSpread = _nonIterableSpread;

  function _toConsumableArray(arr) {
    return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
  }

  var toConsumableArray = _toConsumableArray;

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  var arrayWithHoles = _arrayWithHoles;

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  var iterableToArrayLimit = _iterableToArrayLimit;

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var nonIterableRest = _nonIterableRest;

  function _slicedToArray(arr, i) {
    return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
  }

  var slicedToArray = _slicedToArray;

  function createCommonjsModule(fn, basedir, module) {
  	return module = {
  	  path: basedir,
  	  exports: {},
  	  require: function (path, base) {
        return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
      }
  	}, fn(module, module.exports), module.exports;
  }

  function commonjsRequire () {
  	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
  }

  var _typeof_1 = createCommonjsModule(function (module) {
    function _typeof(obj) {
      "@babel/helpers - typeof";

      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        module.exports = _typeof = function _typeof(obj) {
          return typeof obj;
        };
      } else {
        module.exports = _typeof = function _typeof(obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
      }

      return _typeof(obj);
    }

    module.exports = _typeof;
  });

  function noop() {}

  function assign(tar, src) {
    for (var k in src) {
      tar[k] = src[k];
    }

    return tar;
  }

  function assignTrue(tar, src) {
    for (var k in src) {
      tar[k] = 1;
    }

    return tar;
  }

  function addLoc(element, file, line, column, char) {
    element.__svelte_meta = {
      loc: {
        file: file,
        line: line,
        column: column,
        char: char
      }
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

    this.destroy = function () {
      console.warn('Component was already destroyed');
    };
  }

  function _differs(a, b) {
    return a != a ? b == b : a !== b || a && _typeof_1(a) === 'object' || typeof a === 'function';
  }

  function fire(eventName, data) {
    var handlers = eventName in this._handlers && this._handlers[eventName].slice();

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
      cancel: function cancel() {
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
      this.fire("state", {
        changed: changed,
        current: this._state,
        previous: oldState
      });

      this._fragment.p(changed, this._state);

      this.fire("update", {
        changed: changed,
        current: this._state,
        previous: oldState
      });
    }
  }

  function _stage(newState) {
    assign(this._staged, newState);
  }

  function setDev(newState) {
    if (_typeof_1(newState) !== 'object') {
      throw new Error(this._debugName + '.set was called without an object of data key-values to update.');
    }

    this._checkReadOnly(newState);

    set.call(this, newState);
  }

  function callAll(fns) {
    while (fns && fns.length) {
      fns.shift()();
    }
  }

  function _mount(target, anchor) {
    this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
  }
  var protoDev = {
    destroy: destroyDev,
    get: get,
    fire: fire,
    on: on,
    set: setDev,
    _recompute: noop,
    _set: _set,
    _stage: _stage,
    _mount: _mount,
    _differs: _differs
  };

  var TAGS = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  var COMMENTS_AND_PHP_TAGS = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
  var defaultAllowed = '<a><span><b><br><br/><i><strong><sup><sub><strike><u><em><tt>';
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
    input = String(input); // strip tags

    if (input.indexOf('<') < 0 || input.indexOf('>') < 0) {
      return input;
    }

    input = stripTags(input, allowed); // remove all event attributes

    if (typeof document === 'undefined') return input;
    var d = document.createElement('div');
    d.innerHTML = input;
    var sel = d.querySelectorAll('*');

    for (var i = 0; i < sel.length; i++) {
      if (sel[i].nodeName.toLowerCase() === 'a') {
        // special treatment for <a> elements
        if (sel[i].getAttribute('target') !== '_self') sel[i].setAttribute('target', '_blank');
        sel[i].setAttribute('rel', 'nofollow noopener noreferrer');

        if (sel[i].getAttribute('href') && sel[i].getAttribute('href').trim().startsWith('javascript:')) {
          // remove entire href to be safe
          sel[i].setAttribute('href', '');
        }
      }

      for (var j = 0; j < sel[i].attributes.length; j++) {
        var attrib = sel[i].attributes[j];

        if (attrib.specified) {
          if (attrib.name.substr(0, 2) === 'on') sel[i].removeAttribute(attrib.name);
        }
      }
    }

    return d.innerHTML;
  }

  function stripTags(input, allowed) {
    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    allowed = (((allowed !== undefined ? allowed || '' : defaultAllowed) + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
    var before = input;
    var after = input; // recursively remove tags to ensure that the returned string doesn't contain forbidden tags after previous passes (e.g. '<<bait/>switch/>')

    while (true) {
      before = after;
      after = before.replace(COMMENTS_AND_PHP_TAGS, '').replace(TAGS, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
      }); // return once no more tags are removed

      if (before === after) {
        return after;
      }
    }
  }

  /**
   * getCellRenderer defines what classes are set on each HOT cell
   */

  function getCellRenderer (app, chart, dataset, Handsontable) {
    var colTypeIcons = {
      date: 'fa fa-clock-o'
    };

    function HtmlCellRender(instance, TD, row, col, prop, value, cellProperties) {
      var escaped = purifyHTML(Handsontable.helper.stringify(value));
      TD.innerHTML = escaped; // this is faster than innerHTML. See: https://github.com/warpech/jquery-handsontable/wiki/JavaScript-&-DOM-performance-tips
    }

    return function (instance, td, row, col, prop, value, cellProperties) {
      if (dataset.numColumns() <= col || !dataset.hasColumn(col)) return;
      var column = dataset.column(col);

      var _app$get = app.get(),
          searchResults = _app$get.searchResults,
          currentResult = _app$get.currentResult,
          activeColumn = _app$get.activeColumn;

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

      var rowPosition = Handsontable.hooks.run(instance, 'modifyRow', row); // const rowPosition = row; // instance.getPlugin('columnSorting').untranslateRow(row);

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

      if (column.isComputed && column.errors.length && column.errors.find(function (err) {
        return err.row === 'all' || err.row === row - 1;
      })) {
        td.classList.add('parsingError');
      }

      if (cellProperties.readOnly) td.classList.add('readOnly');

      if (chart.dataCellChanged(col, row)) {
        td.classList.add('changed');
      }

      HtmlCellRender(instance, td, row, col, prop, value); // Reflect.apply(HtmlCellRender, this, arguments);
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
    if (!o || _typeof_1(o) !== 'object') return o;

    try {
      return JSON.parse(JSON.stringify(o));
    } catch (e) {
      return o;
    }
  }

  var app = null;
  var searchTimer = null;

  function currentResult(_ref) {
    var searchResults = _ref.searchResults,
        searchIndex = _ref.searchIndex;
    if (!searchResults || !searchResults.length) return null;
    var l = searchResults.length;

    if (searchIndex < 0 || searchIndex >= l) {
      while (searchIndex < 0) {
        searchIndex += l;
      }

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
    render: function render() {
      var _this$get = this.get(),
          hot = _this$get.hot;

      hot.render();
    },
    doSearch: function doSearch() {
      var _this = this;

      var _this$get2 = this.get(),
          hot = _this$get2.hot,
          search = _this$get2.search;

      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        if (!hot || !search) {
          _this.set({
            searchResults: []
          });
        } else {
          var searchPlugin = hot.getPlugin('search');
          var searchResults = searchPlugin.query(search);

          _this.set({
            searchResults: searchResults
          });
        }
      }, 300);
    },
    update: function update() {
      var _this2 = this;

      var _this$get3 = this.get(),
          data = _this$get3.data,
          transpose = _this$get3.transpose,
          firstRowIsHeader = _this$get3.firstRowIsHeader,
          skipRows = _this$get3.skipRows,
          hot = _this$get3.hot;

      if (!data) return; // get chart

      var _this$store$get = this.store.get(),
          dw_chart = _this$store$get.dw_chart; // pass dataset through chart to apply changes and computed columns


      var ds = dw_chart.dataset(dw.datasource.delimited({
        csv: data,
        transpose: transpose,
        firstRowIsHeader: firstRowIsHeader,
        skipRows: skipRows
      }).parse()).dataset();
      this.set({
        columnOrder: ds.columnOrder()
      }); // construct HoT data array

      var hotData = [[]];
      ds.eachColumn(function (c) {
        return hotData[0].push(c.title());
      });
      ds.eachRow(function (r) {
        var row = [];
        ds.eachColumn(function (col) {
          return row.push(col.raw(r));
        });
        hotData.push(row);
      }); // pass data to hot

      hot.loadData(hotData);
      var cellRenderer = getCellRenderer(this, dw_chart, ds, HOT);
      hot.updateSettings({
        cells: function cells(row, col) {
          var _this2$get = _this2.get(),
              readonly = _this2$get.readonly;

          return {
            readOnly: readonly || ds.hasColumn(col) && ds.column(col).isComputed && row === 0,
            renderer: cellRenderer
          };
        },
        manualColumnMove: []
      });
      this.set({
        ds: ds
      });
      this.set({
        has_changes: clone(chart.get('metadata.data.changes', [])).length > 0
      });
      HOT.hooks.once('afterRender', function () {
        return _this2.initCustomEvents();
      });
      HOT.hooks.once('afterRender', function () {
        return _this2.fire('afterRender');
      });
      hot.render();
    },
    dataChanged: function dataChanged(cells) {
      var _this3 = this;

      var _this$get4 = this.get(),
          hot = _this$get4.hot;

      var changed = false;
      cells.forEach(function (_ref2) {
        var _ref3 = slicedToArray(_ref2, 4),
            row = _ref3[0],
            col = _ref3[1],
            oldValue = _ref3[2],
            newValue = _ref3[3];

        if (oldValue !== newValue) {
          var _chart = _this3.store.get().dw_chart;

          var _this3$get = _this3.get(),
              transpose = _this3$get.transpose;

          var changes = clone(_chart.get('metadata.data.changes', []));
          row = hot.toPhysicalRow(row);
          col = _chart.dataset().columnOrder()[col];

          if (transpose) {
            // swap row and col
            var tmp = row;
            row = col;
            col = tmp;
          } // store new change


          changes.push({
            column: col,
            row: row,
            value: newValue,
            previous: oldValue,
            time: new Date().getTime()
          });

          _chart.set('metadata.data.changes', changes);

          changed = true;
        }
      });

      if (changed) {
        setTimeout(function () {
          _this3.update();

          chart.save();
        }, 100);
      }
    },
    columnMoved: function columnMoved(srcColumns, tgtIndex) {
      var _this4 = this;

      var _this$get5 = this.get(),
          hot = _this$get5.hot;

      if (!srcColumns.length) return;

      var _this$get6 = this.get(),
          columnOrder = _this$get6.columnOrder;

      var newOrder = columnOrder.slice(0);
      var after = columnOrder[tgtIndex];
      var elements = newOrder.splice(srcColumns[0], srcColumns.length);
      var insertAt = after === undefined ? newOrder.length : after ? newOrder.indexOf(after) : 0;
      newOrder.splice.apply(newOrder, [insertAt, 0].concat(toConsumableArray(elements)));
      this.store.get().dw_chart.set('metadata.data.column-order', newOrder.slice(0));
      this.set({
        columnOrder: newOrder
      }); // update selection

      HOT.hooks.once('afterRender', function () {
        setTimeout(function () {
          _this4.fire('resetSort');

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
      var _this$get7 = this.get(),
          hot = _this$get7.hot;

      var _this$get8 = this.get(),
          ds = _this$get8.ds;

      if (c === c2 && r === 0 && r2 === hot.countRows() - 1) {
        // const chart = this.store.get('dw_chart');
        // this.set({activeColumn: chart.dataset().column(c)});
        return;
      }

      if (c !== c2 && r === 0 && r2 === hot.countRows() - 1) {
        var sel = [];

        for (var i = Math.min(c, c2); i <= Math.max(c, c2); i++) {
          sel.push(+document.querySelector("#data-preview .htCore tbody tr:first-child td:nth-child(".concat(i + 2, ")")).dataset.column);
        }

        this.set({
          multiSelection: sel.map(function (i) {
            return ds.column(i);
          }),
          activeColumn: null
        });
        return;
      }

      this.set({
        activeColumn: null,
        multiSelection: false
      });
    },
    initCustomEvents: function initCustomEvents() {
      var _this5 = this;

      // wait a bit to make sure HoT is rendered
      setTimeout(function () {
        // catch click events on A,B,C,D... header row
        _this5.refs.hot.querySelectorAll('.htCore thead th:first-child').forEach(function (th) {
          th.removeEventListener('click', topLeftCornerClick);
          th.addEventListener('click', topLeftCornerClick);
        }); // const cellHeaderClickHandler = cellHeaderClick(app);


        _this5.refs.hot.querySelectorAll('.htCore thead th+th').forEach(function (th) {
          th.removeEventListener('click', cellHeaderClick);
          th.addEventListener('click', cellHeaderClick);
        });
      }, 500);
    },
    getColumnFormat: function getColumnFormat(name) {
      var _this$store$get2 = this.store.get(),
          dw_chart = _this$store$get2.dw_chart;

      var colFormats = dw_chart.get('metadata.data.column-format', {});
      return colFormats[name] || {
        type: 'auto',
        ignore: false
      };
    }
  };

  function oncreate() {
    var _this6 = this;

    app = this;
    HOT.hooks.once('afterRender', function () {
      return _this6.initCustomEvents();
    });
    window.addEventListener('keyup', function (evt) {
      var _this6$get = _this6.get(),
          activeColumn = _this6$get.activeColumn,
          ds = _this6$get.ds;

      if (!activeColumn) return;
      if (evt.target.tagName.toLowerCase() === 'input' || evt.target.tagName.toLowerCase() === 'textarea') return;

      if (evt.key === 'ArrowRight' || evt.key === 'ArrowLeft') {
        evt.preventDefault();
        evt.stopPropagation();
        var currentIndex = ds.indexOf(activeColumn.name());

        if (evt.key === 'ArrowRight') {
          // select next column
          _this6.set({
            activeColumn: ds.column((currentIndex + 1) % ds.numColumns())
          });
        } else {
          // select prev column
          _this6.set({
            activeColumn: ds.column((currentIndex - 1 + ds.numColumns()) % ds.numColumns())
          });
        }
      }
    });

    var _this$store$get3 = this.store.get(),
        dw_chart = _this$store$get3.dw_chart;

    var hot = new HOT(this.refs.hot, {
      data: [],
      rowHeaders: function rowHeaders(i) {
        var ti = HOT.hooks.run(hot, 'modifyRow', i); // const ti = hot.getPlugin('ColumnSorting').translateRow(i);

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
      autoColumnSize: {
        useHeaders: true,
        syncLimit: 5
      },
      // // sorting
      sortIndicator: true,
      columnSorting: true,
      sortFunction: function sortFunction(sortOrder, columnMeta) {
        if (columnMeta.col > -1) {
          var column = dw_chart.dataset().column(columnMeta.col);
          var colType = column.type();
          return function (a, b) {
            if (a[0] === 0) return -1; // replace with values

            a[1] = column.val(a[0] - 1);
            b[1] = column.val(b[0] - 1);

            if (colType === 'number') {
              // sort NaNs at bottom
              if (isNaN(a[1])) a[1] = !sortOrder ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
              if (isNaN(b[1])) b[1] = !sortOrder ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
            }

            if (colType === 'date') {
              if (typeof a[1] === 'string') a[1] = new Date(110, 0, 1);
              if (typeof b[1] === 'string') b[1] = new Date(110, 0, 1);
            }

            return (sortOrder === 'desc' ? -1 : 1) * (a[1] > b[1] ? 1 : a[1] < b[1] ? -1 : 0);
          };
        }

        return function (a, b) {
          return a[0] - b[0];
        };
      },
      afterGetColHeader: function afterGetColHeader(col, th) {
        var _this6$get2 = _this6.get(),
            activeColumn = _this6$get2.activeColumn,
            ds = _this6$get2.ds;

        if (!ds || !ds.hasColumn(col)) return;

        if ((col === 0 || col) && activeColumn && ds.column(col).name() === activeColumn.name()) {
          th.classList.add('selected');
        }

        if (col === 0 || col) {
          if (_this6.getColumnFormat(ds.column(col).name()).ignore) {
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
    this.set({
      hot: hot
    });
    HOT.hooks.add('afterSetDataAtCell', function (a) {
      return _this6.dataChanged(a);
    });
    HOT.hooks.add('afterColumnMove', function (a, b) {
      return _this6.columnMoved(a, b);
    });
    HOT.hooks.add('afterRender', function () {
      return _this6.updateHeight();
    });
    HOT.hooks.add('afterSelection', function (r, c, r2, c2) {
      return _this6.checkRange(r, c, r2, c2);
    });
  }

  function onstate(_ref4) {
    var changed = _ref4.changed,
        current = _ref4.current,
        previous = _ref4.previous;
    var hot = current.hot;
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
      this.set({
        searchIndex: 0
      });
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
      setTimeout(function () {
        return hot.render();
      }, 10);
    }

    if (changed.fixedColumnsLeft) {
      hot.updateSettings({
        fixedColumnsLeft: current.fixedColumnsLeft
      });
    }

    if (changed.sorting) {
      hot.getPlugin('columnSorting').sort(chart.dataset().indexOf(current.sorting.sortBy), current.sorting.sortDir ? 'asc' : 'desc');
    }
  }

  function cellHeaderClick(evt) {
    var th = this; // reset the HoT selection
    // find out which data column we're in

    var k = th.parentNode.children.length;
    var thIndex = -1; // (stupid HTMLCollection has no indexOf)

    for (var i = 0; i < k; i++) {
      if (th.parentNode.children.item(i) === th) {
        thIndex = i;
        break;
      }
    } // find column index


    var colIndex = +app.refs.hot.querySelector(".htCore tbody tr:first-child td:nth-child(".concat(thIndex + 1, ")")).dataset.column;

    var _app$store$get = app.store.get(),
        dw_chart = _app$store$get.dw_chart;

    var _app$get = app.get(),
        activeColumn = _app$get.activeColumn,
        hot = _app$get.hot;

    if (dw_chart.dataset().hasColumn(colIndex)) {
      var newActive = dw_chart.dataset().column(+colIndex); // set active column (or unset if it's already set)

      if (activeColumn && activeColumn.name() === newActive.name()) {
        evt.target.parentNode.classList.remove('selected');
        app.set({
          activeColumn: false
        });
        hot.deselectCell();
      } else {
        evt.target.parentNode.classList.add('selected');
        app.set({
          activeColumn: newActive
        });
      }
    }
  }

  function topLeftCornerClick(evt) {
    evt.preventDefault();

    var _app$get2 = app.get(),
        transpose = _app$get2.transpose;

    app.set({
      transpose: !transpose
    });
    app.update();
  }

  var file = "describe/hot/Handsontable.html";

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
    var _this7 = this;

    this._debugName = '<Handsontable>';

    if (!options || !options.target && !options.root) {
      throw new Error("'target' is a required option");
    }

    init(this, options);
    this.refs = {};
    this._state = assign(data(), options.data);

    this._recompute({
      searchResults: 1,
      searchIndex: 1
    }, this._state);

    if (!('searchResults' in this._state)) console.warn("<Handsontable> was created without expected data property 'searchResults'");
    if (!('searchIndex' in this._state)) console.warn("<Handsontable> was created without expected data property 'searchIndex'");
    this._intro = true;
    this._handlers.state = [onstate];
    onstate.call(this, {
      changed: assignTrue({}, this._state),
      current: this._state
    });
    this._fragment = create_main_fragment(this, this._state);

    this.root._oncreate.push(function () {
      oncreate.call(_this7);

      _this7.fire("update", {
        changed: assignTrue({}, _this7._state),
        current: _this7._state
      });
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
      if (this._differs(state.currentResult, state.currentResult = currentResult(state))) changed.currentResult = true;
    }
  };

  var main = {
    Handsontable: Handsontable
  };

  return main;

}));
//# sourceMappingURL=hot.js.map
