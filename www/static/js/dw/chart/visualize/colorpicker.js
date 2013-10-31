/*
 * this is the (old) color picker used in visualize step
 */

define(function() {

    $.fn.colorpicker = function(props) {
        var rt = $(this), colors, active, maxW = props.maxW || $(rt).parent().width();
        if (!rt.data('colors')) return;
        colors = rt.data('colors').toLowerCase().split(',');
        active = (rt.data('color') || "").toLowerCase();
        // clean up html at first
        rt.html('');
        rt.css({
            position: 'relative'
        });
        var c = 0, r = 0;
        $.each(colors, function(i, col) {
            if (!col) return;
            var d = $('<div />');
            if ((c+1)*28 > maxW) {
                c = 0;
                r+=1;
                rt.css('height', (r+1)*28+4);
            }
            d.css({
                position: 'absolute',
                left: c*28 - (col == active ? 1 : 0),
                top: r*28 + (col == active ? -1 : 0),
                height: 26,
                width: 26,
                cursor: 'pointer',
                background: col,
                'border-radius': col == active ? 4 : 0,
                'border-width': col == active ? 3 : 2,
                'border-style': 'solid',
                'border-color': col == active ? 'black' : 'white',
                'z-index': (col == active ? '10' : '0')
            });
            d.data('color', col);
            d.click(function(e) {
                var a = $(e.target);
                rt.data('color', a.data('color'));
                rt.colorpicker(props);
                if (props && props.change) props.change(rt.data('color'));
            });
            rt.append(d);
            c += 1;

        });
    };

});