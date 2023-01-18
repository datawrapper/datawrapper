/* globals dw */
import { select, event } from 'd3-selection';
import { isFunction } from 'underscore';
import { f } from 'd3-jetpack/essentials'; // eslint-disable-line no-unused-vars

export default function (me, el, { axisType = 'columns', rtl = false } = {}) {
    const column = dw.utils.columnNameColumn(me.axes(true)[axisType]);
    const filter = utilsFilter({ column, active: 0, rtl });
    const filterUI = filter.ui(me);
    let filterH = 0;
    const postEvent = me.chart().createPostEvent();

    if (filterUI) {
        (function () {
            const parent = select(el.parentElement);
            let header = parent.selectAll('.dw-chart-header');

            if (header.nodes().length === 0) {
                parent.insert('div.dw-chart-header.fake', ':first-child');
                header = parent.selectAll('.dw-chart-header');
            } else if (header.nodes().length > 1) {
                parent.selectAll('.dw-chart-header.fake').remove();
                header = parent.selectAll('.dw-chart-header');
            }

            const oldHeaderHeight = header.nodes()[0].clientHeight;

            header.append(() => filterUI.node());
            filterH = header.nodes()[0].clientHeight - oldHeaderHeight;
            me.__filterH = filterH;

            filter.change((val, i) => {
                me.__lastRow = i;
                me.update();
                postEvent('column:change', { value: val, index: i });
                me.fire('column:change', { value: val, index: i });
            });
        })();
    }
    me.__filterUI = filterUI;
}
/**
 * @param column  the values that can be selected
 * @paran type    type of filter ui: buttons|select|timescale
 * @param format  a function for formatting the values
 */
function utilsFilter({ column, active, type = 'auto', rtl = false }) {
    const callbacks = [];

    if (type === 'auto') {
        if (column.type() === 'date') {
            type = 'timescale';
        } else {
            type = column.length < 6 ? 'buttons' : 'select';
        }
    }

    const filter = {
        ui: getFilterUI(type),
        change: function (callback) {
            callbacks.push(callback);
        }
    };

    function update(i) {
        callbacks.forEach(cb => {
            if (isFunction(cb)) {
                cb(column.val(i), i);
            }
        });
    }

    function getFilterUI(type) {
        if (column.length < 2) return () => false;

        function handleClick(d, i, nodes) {
            event.preventDefault();
            const a = select(this);
            if (a.classed('active')) return;
            nodes.forEach(n => select(n).classed('active', false));
            a.classed('active', true);
            update(i);
        }

        if (type === 'select') {
            return function () {
                // use select
                const sel = select(document.createElement('select')).attr(
                    'class',
                    'filter-ui filter-select'
                );
                sel.selectAll('option')
                    .data(column.values())
                    .enter()
                    .append('option')
                    .attr('value', (d, i) => i)
                    .html((d, i) => String(column.raw()[i]).trim());
                sel.on('change', () => update(sel.node().value));
                return sel;
            };
        } else if (type === 'buttons') {
            return function (vis) {
                // use link buttons
                let options = column
                    .values()
                    .filter((d, i) => column.raw()[i])
                    .map((c, i) => {
                        return { content: column.raw()[i], _i: i };
                    });
                if (rtl) options = options.slice(0).reverse();

                // filter-ui should be in .dw-chart-header so that the correct css gets applied
                const header = select('.dw-chart .dw-chart-header');
                const tempHeader = !header.node()
                    ? select('.dw-chart .dw-chart-styles').append('div.dw-chart-header.fake')
                    : false;

                const div = select(header.node() || tempHeader.node()).append(
                    'div.filter-ui.filter-links'
                );

                div.selectAll('a')
                    .data(options)
                    .enter()
                    .append('a')
                    .attr('href', d => `#${d._i}`)
                    .classed('active', d => d._i === active)
                    .classed('link-style-ignore', true)
                    .html(d => String(d.content).trim())
                    .on('click', handleClick);

                const al = div.select('a:last-child').node();
                const lastTabBbox = vis.chart().getElementBounds(al);
                const containerBbox = vis.chart().getElementBounds(al.parentElement);

                // now that we've measured, we can remove from the dom again
                (tempHeader || div).remove();

                // check if last tab overflows outside of container
                const overflows = rtl
                    ? lastTabBbox.left < containerBbox.left
                    : lastTabBbox.right > containerBbox.right;

                // fall back to select if tabs don't fit
                return overflows ? getFilterUI('select')(vis) : div;
            };
        } else if (type === 'timescale') {
            return function (vis) {
                const w = Math.min(vis.__w - 35);
                const daysDelta = Math.round(
                    (column.val(-1).getTime() - column.val(0).getTime()) / 86400000
                );

                function getLeft(width, date) {
                    const perc = (column.val(-1).getTime() - date.getTime()) / 86400000 / daysDelta;
                    return width * (rtl ? perc : 1 - perc);
                }

                const timesel = select(document.createElement('div'))
                    .attr('class', 'filter-ui')
                    .style('position', 'relative')
                    .style('height', '45px')
                    .style('margin-left', '3px');

                let lastPointLeft = 0;

                timesel
                    .selectAll('div')
                    .data(column.values())
                    .enter()
                    .append('div')
                    .append('div.point')
                    .classed('active', (d, i) => i === 0)
                    .style('left', (d, i) => {
                        const left = getLeft(w, d);
                        if (i === (rtl ? 0 : column.length - 1)) lastPointLeft = left;
                        return left + 'px';
                    })
                    .on('click', handleClick)
                    .parent()
                    .append('div.point-label')
                    .html((d, i) => column.raw()[i])
                    .style('left', d => getLeft(w, d) + 'px');

                timesel.append('div.line').style('width', lastPointLeft + 'px');
                return timesel;
            };
        } else {
            return () => false;
        }
    }
    return filter;
}
