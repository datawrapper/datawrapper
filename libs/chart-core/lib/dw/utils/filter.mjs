import { isFunction, isString } from 'underscore';
import $ from 'jquery';

/**
 * @param column  the values that can be selected
 * @paran type    type of filter ui: buttons|select|timescale
 * @param format  a function for formatting the values
 */
export default function(column, active, type) {
    const callbacks = [];

    type = type || 'auto';

    if (type === 'auto') {
        if (column.type() === 'date') type = 'timescale';
        else if (column.type() === 'text') type = column.length < 6 ? 'buttons' : 'select';
    }

    const filter = {
        ui: getFilterUI(type),
        change: function(callback) {
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
        let f;

        if (type === 'auto') {
            type =
                column.type() === 'date' ? 'timescale' : column.length < 6 ? 'buttons' : 'select';
        }

        if (column.length < 2)
            return function() {
                return false;
            };

        if (type === 'select')
            f = function() {
                // use <select>
                const select = $('<select />');
                column.each(function(val, i) {
                    const lbl = column.raw()[i];
                    if (!lbl) return;
                    select.append(
                        '<option value="' +
                            i +
                            '">' +
                            (isString(lbl) ? $.trim(lbl) : lbl) +
                            '</option>'
                    );
                });
                select.change(function() {
                    update(select.val());
                });
                select.addClass('filter-ui filter-select');
                return select;
            };

        if (type === 'buttons')
            f = function(vis) {
                // use link buttons
                const div = $('<div />');
                div.addClass('filter-ui filter-links');
                column.each(function(val, i) {
                    const lbl = column.raw()[i];
                    if (!lbl) return;
                    const a = $(
                        '<a href="#' +
                            i +
                            '"' +
                            (i === active ? ' class="active" ' : '') +
                            '>' +
                            (isString(lbl) ? $.trim(lbl) : lbl) +
                            '</a>'
                    ).data('row', i);
                    div.append(a);
                });
                $('a', div).click(function(e) {
                    const a = $(e.target);
                    e.preventDefault();
                    if (a.hasClass('active')) return;
                    $('a', div).removeClass('active');
                    a.addClass('active');
                    update(a.data('row'));
                });
                div.appendTo('body');

                const fy = $('a:first', div).offset().top + $('a:first', div).height();
                const ly = $('a:last', div).offset().top + $('a:last', div).height();
                const diff = ly - fy;

                if (diff > 1) {
                    div.remove();
                    return getFilterUI('select')(vis); // fall back to select
                }

                return div;
            };

        if (type === 'timescale')
            f = function(vis) {
                const w = Math.min(vis.__w - 35);
                const timesel = $('<div></div>')
                    .css({
                        position: 'relative',
                        height: 45,
                        'margin-left': 3
                    })
                    .addClass('filter-ui');
                const daysDelta = Math.round(
                    (column.val(-1).getTime() - column.val(0).getTime()) / 86400000
                );

                function getLeft(width, date) {
                    const perc = (column.val(-1).getTime() - date.getTime()) / 86400000 / daysDelta;
                    return width * (1 - perc);
                }

                let lastPointLeft = 0;

                for (let i = 0; i < column.length; i++) {
                    const di = $('<div class="point"></div>');
                    di.data('row', i);
                    di.css('left', getLeft(w, column.val(i)) + 'px');
                    timesel.append(di);

                    const dit = $('<div class="point-label">' + column.raw()[i] + '</div>');
                    dit.css('left', getLeft(w, column.val(i)) + 'px');
                    timesel.append(dit);

                    if (i === 0) di.addClass('active');

                    const left = getLeft(w, column.val(i));
                    if (left > lastPointLeft) {
                        lastPointLeft = left;
                    }
                }

                const offsetRight = lastPointLeft;

                timesel.append('<div class="line"></div>');
                $('.line', timesel).width(offsetRight);

                $('.point', timesel).click(function(e) {
                    const a = $(e.target);
                    e.preventDefault();
                    if (a.hasClass('active')) return;
                    $('.point', timesel).removeClass('active');
                    a.addClass('active');
                    update(a.data('row'));
                });

                return timesel;
            };

        return f;
    }

    return filter;
}
