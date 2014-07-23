
/**
 * @param column  the values that can be selected
 * @paran type    type of filter ui: buttons|select|timescale
 * @param format  a function for formatting the values
 */
dw.utils.filter = function (column, active, type, format) {
    var callbacks = [];

    type = type || 'auto';
    format = format || _.identity;

    if (type == 'auto') {
        if (column.type() == 'date') type = 'timescale';
        else if (column.type() == 'text') type = column.length < 6 ? 'buttons' : 'select';
    }

    var filter = {
        ui: getFilterUI(type),
        change: function(callback) {
            callbacks.push(callback);
        }
    };

    function update(i) {
        _.each(callbacks, function(cb) {
            if (_.isFunction(cb)) {
                cb(column.val(i), i);
            }
        });
    }


    function getFilterUI(type) {
        var f;

        if (type == 'auto') {
            type = column.type() == 'date' ? 'timescale' :
                column.length < 6 ? 'buttons' : 'select';
        }

        if (column.length < 2) return function() { return false; };

        if (type == 'select') f = function(vis) {
            // use <select>
            var select = $('<select />');
            column.each(function(val, i) {
                var lbl = format(val);
                if (!lbl) return;
                select.append('<option value="'+i+'">'+(_.isString(lbl) ? $.trim(lbl) : lbl)+'</option>');
            });
            select.change(function(evt) {
                var cur = select.val();
                update(cur);
            });
            select.addClass('filter-ui filter-select');
            return select;
        };

        if (type == 'buttons') f = function(vis) {
            // use link buttons
            var div = $('<div />');
            div.addClass('filter-ui filter-links');
            column.each(function(val, i) {
                var lbl = format(val);
                if (!lbl) return;
                var a = $('<a href="#'+i+'"'+(i == active ? ' class="active" ': '')+'>'+(_.isString(lbl) ? $.trim(lbl) : lbl)+'</a>').data('row', i);
                div.append(a);
            });
            $('a', div).click(function(e) {
                var a = $(e.target);
                e.preventDefault();
                if (a.hasClass('active')) return;
                $('a', div).removeClass('active');
                a.addClass('active');
                update(a.data('row'));
            });
            div.appendTo('body');
            var fy = $('a:first', div).offset().top,
                ly = $('a:last', div).offset().top;
            if (fy != ly) {
                div.remove();
                return getFilterUI('select')(vis); // fall back to select
            }
            return div;
        };

        if (type == 'timescale') f = function(vis) {
            var w = Math.min(vis.__w-30, Math.max(300, vis.__w * 0.7)),
                timescale = d3.time.scale()
                    .domain([column.val(0), column.val(-1)])
                    .range([0, w]),
                timesel = $('<div></div>').css({
                    position:'relative',
                    height: 45,
                    'margin-left': 3
                }).addClass('filter-ui'),
                nticks = w / 80,
                ticks = timescale.ticks(nticks),
                daysDelta = Math.round((column.val(-1).getTime() - column.val(0).getTime()) / 86400000),
                fmt = dw.utils.dateFormat(daysDelta),
                lfmt = column.type(true).formatter(),
                dots = timescale.ticks(w / 8),
                lbl_x = function(i) { return Math.max(-18, timescale(column.val(i)) - 40); };

            // show text labels for bigger tick marks (about every 80 pixel)
            _.each(ticks, function(d) {
                var s = $('<span>'+fmt(d)+'</span>'),
                    x = timescale(d) - 40,
                    lw = vis.labelWidth(fmt(d));
                if (40 - lw*0.5 + x < 0) x = -40 +0.5 * lw;
                s.css({ position: 'absolute', top:0, width: 80, left: x,
                    'text-align': 'center', opacity: 0.55 });
                timesel.append(s);
            });

            // show tiny tick marks every 15 pixel
            _.each(dots, function(d) {
                if (d.getTime() < column.val(0).getTime() || d.getTime() > column.val(-1).getTime()) return;
                var s = $('<span class="dot"></span>');
                s.css({
                    position: 'absolute',
                    bottom: 19,
                    width: 1,
                    height: '1ex',
                    'border-left': '1px solid #000',
                    'vertical-align': 'bottom',
                    left: Math.round(timescale(d))+0.5
                });
                if (!_.find(ticks, function(td) { return d.getTime() == td.getTime(); })) {
                    s.css({ height: '0.6ex', opacity: 0.5 });
                }
                timesel.append(s);
            });

            // a pointer symbol to highlight the current date
            var pointer = $('<div>▲</div>').css({
                position: 'absolute',
                width: 20,
                bottom: 2,
                left: timescale(column.val(active))-9,
                'text-align': 'center'});
            timesel.append(pointer);

            // a label to show the current date
            var lbl = $('<div><span></span></div>').css({
                position: 'absolute',
                width: 80,
                top: 0,
                left: lbl_x(active),
                'text-align': 'center'
            })
             .data('last-txt', lfmt(column.val(active)))
             .data('last-left', lbl_x(active));

            $('span', lbl).css({
                background: vis.theme().colors.background,
                'font-weight': 'bold',
                'padding': '0 1ex'
            }).html(lfmt(column.val(active)));
            timesel.append(lbl);

            // add hairline as time axis
            $('<div />').css({
                position: 'absolute',
                width: w+1,
                bottom: 15,
                height: 2,
                'border-bottom': '1px solid #000'
            }).appendTo(timesel);

            // add an invisible div to catch mouse events
            var bar = $('<div />').css({
                position: 'absolute',
                left: 0,
                width: w,
                height: 40
            });
            timesel.append(bar);

            /*
             * this helper function returns the nearest date to an x position
             */
            function nearest(rel_x) {
                var x_date = timescale.invert(rel_x),
                    min_dist = Number.MAX_VALUE,
                    nearest_row = 0;
                // find nearest date
                column.each(function(date, i) {
                    var dist = Math.abs(date.getTime() - x_date.getTime());
                    if (dist < min_dist) {
                        min_dist = dist;
                        nearest_row = i;
                    }
                });
                return nearest_row;
            }

            var autoClickTimer;

            // clicking the bar updates the visualization
            bar.click(function(evt) {
                // find nearest data row
                var rel_x = evt.clientX - bar.offset().left,
                    nearest_row = nearest(rel_x);
                update(nearest_row);
                timesel.data('update-func')(nearest_row);
                clearTimeout(autoClickTimer);
            });

            // hovering the bar shows nearest date
            bar.mousemove(function(evt) {
                var rel_x = evt.clientX - bar.offset().left,
                    nearest_row = nearest(rel_x);
                $('span', lbl).html(lfmt(column.val(nearest_row)));
                lbl.css({ left: lbl_x(nearest_row) });
                pointer.css({ left: timescale(column.val(nearest_row)) - 10 });
                clearTimeout(autoClickTimer);
                autoClickTimer = setTimeout(function() {
                    update(nearest_row);
                    lbl.data('last-left', lbl_x(nearest_row));
                    lbl.data('last-txt', lbl.text());
                }, 500);
            });

            // reset position after mouse has gone
            bar.mouseleave(function() {
                lbl.css({ left: lbl.data('last-left') });
                pointer.css({ left: lbl.data('last-left')+30 });
                $('span', lbl).html(lbl.data('last-txt'));
                clearTimeout(autoClickTimer);
            });

            timesel.data('update-func', function(i) {
                pointer.stop().animate({ left: timescale(column.val(i)) - 10 }, 500, 'expoInOut');

                var l_x = lbl_x(i),
                    lbl_txt = lfmt(column.val(i));

                $('span', lbl).html(lbl_txt);
                lbl.css({ left: l_x });
                lbl.data('last-left', l_x);
                lbl.data('last-txt', lbl_txt);
            });
            return timesel;
        };

        return f;
    }

    return filter;
};
