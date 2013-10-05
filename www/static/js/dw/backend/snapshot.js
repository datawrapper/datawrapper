
define(function() {

    /*
     * creates a client-side PNG snapshop of a chart in a given iframe
     * and sends it to the Datawrapper API right after
     */
    return function(iframe, chart_id, thumb_id, width, height, callback) {

        function px(s) { return Math.floor(Number(s.substr(0, s.length-2))); }

        var body = iframe.get(0).contentDocument,
            win = iframe.get(0).contentWindow,
            vis = win.__dw ? win.__dw.vis : false;

        if (!vis || !vis._svgCanvas()) return false;

        var c = win.__dw.vis.__canvas,
            x = c.lpad + (c.lpad2 || 0),
            y = 0,
            w = c.w - x - c.rpad,
            h = c.h - y - c.bpad,
            scale = Math.max(width / c.w, height / c.h);

        var canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d");

        canvas.width = c.w * scale;
        canvas.height = c.h * scale;

        ctx.fillStyle = win.__dw.vis.theme().colors.background;
        ctx.fillRect(0, 0, c.w * scale, c.h * scale);
        var svg_src = vis._svgCanvas().innerSVG;
        // remove url fills
        svg_src = svg_src.replace(/fill="url\([^\)]+\)"/g, 'fill="#cccccc"')
                    .replace(/<pattern.*<\/pattern>/g, '');
        ctx.drawSvg(svg_src, 0, 0, c.w * scale, c.h * scale);

        var tempCanvas = document.createElement("canvas"),
            tCtx = tempCanvas.getContext("2d");

        tempCanvas.width = width;
        tempCanvas.height = height;

        tCtx.drawImage(canvas, -x + (width - c.w * scale) * 0.5, -y);

        var imgData = tempCanvas.toDataURL("image/png");
        $.ajax({
            url: '/api/charts/' + chart_id + '/thumbnail/' + thumb_id,
            type: 'PUT',
            data: imgData,
            processData: false,
            dataType: 'json',
            success: function(res) {
                if (res.status == "ok") (callback || function() {})();
                else console.error(res);
            }
        });
    };

});