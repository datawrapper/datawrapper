
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
                var lbl = column.raw()[i];
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
                var lbl = column.raw()[i];
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

            var fy = $('a:first', div).offset().top + $('a:first', div).height(),   
                ly = $('a:last', div).offset().top + $('a:last', div).height(),
                diff = ly - fy;  

            if (diff > 1) {   
                div.remove();   
                return getFilterUI('select')(vis); // fall back to select
            }

            return div;
        };

        if (type == 'timescale') f = function(vis) {
            var w = Math.min(vis.__w-35);
                timesel = $('<div></div>').css({
                    position:'relative',
                    height: 45,
                    'margin-left': 3
                }).addClass('filter-ui'),
                daysDelta = Math.round((column.val(-1).getTime() - column.val(0).getTime()) / 86400000);

            function getLeft(width, date) {
                var perc = ((column.val(-1).getTime() -
                  date.getTime()) / 86400000) / daysDelta;
  
                return (width * (1-perc));
            }

            var dates = [],
              lastPointLeft = 0,
              lastPoint;

            for (var i=0; i<column.length; i++) {
                var di = $('<div class="point"></div>');
                di.data('row', i);
                di.css('left', getLeft(w, column.val(i)) + "px");
                timesel.append(di);

                var dit = $('<div class="point-label">'
                  + column.raw()[i] + '</div>');
                dit.css('left', getLeft(w, column.val(i)) + "px");
                timesel.append(dit);


                if (i==0) di.addClass('active');

                var left = getLeft(w, column.val(i));
                if (left > lastPointLeft) {
                    lastPoint = di;
                    lastPointLeft = left;
                }
            }

            var offsetRight = lastPointLeft;

            timesel.append('<div class="line"></div>');
            $('.line', timesel).width(offsetRight);

            $('.point', timesel).click(function(e) {
                var a = $(e.target);
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
};
