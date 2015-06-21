
define(function() {

    var prefix = {
        xmlns: "http://www.w3.org/2000/xmlns/",
        xlink: "http://www.w3.org/1999/xlink",
        svg: "http://www.w3.org/2000/svg"
    };

    /*
     * creates a client-side PNG snapshop of a chart in a given iframe
     * and sends it to the Datawrapper API right after
     */
    return function(iframe, chart_id, thumb_id, width, height, callback) {

      // add empty svg element
        var emptySvg = window.document.createElementNS(prefix.svg, 'svg');
        emptySvg.setAttribute('width', 1);
        emptySvg.setAttribute('height', 1);
        window.document.body.appendChild(emptySvg);
        var emptySvgDeclarationComputed = getComputedStyle(emptySvg);

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
        var svg = vis._svgCanvas();

        setInlineStyles(svg);

        var svg_src = svg.innerSVG;
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
            success: function(res) {
                if (res.status == "ok") (callback || function() {})();
                else console.log('error:', res.message);
            }
        });

        window.document.body.removeChild(emptySvg);

        function setInlineStyles(svg) {
            function explicitlySetStyle (element) {
                var cSSStyleDeclarationComputed = getComputedStyle(element);
                var i, len, key, value;
                var computedStyleStr = "";
                for (i=0, len=cSSStyleDeclarationComputed.length; i<len; i++) {
                    key=cSSStyleDeclarationComputed[i];
                    value=cSSStyleDeclarationComputed.getPropertyValue(key);
                    if (value!==emptySvgDeclarationComputed.getPropertyValue(key)) {
                        computedStyleStr+=key+":"+value+";";
                    }
                }
                element.setAttribute('style', computedStyleStr);
            }
            function traverse(obj){
                var tree = [];
                tree.push(obj);
                visit(obj);
                function visit(node) {
                    if (node && node.hasChildNodes()) {
                        var child = node.firstChild;
                        while (child) {
                            if (child.nodeType === 1 && child.nodeName != 'SCRIPT'){
                                tree.push(child);
                                visit(child);
                            }
                            child = child.nextSibling;
                        }
                    }
                }
                return tree;
            }
            // hardcode computed css styles inside svg
            var allElements = traverse(svg);
            var i = allElements.length;
            while (i--){
                explicitlySetStyle(allElements[i]);
            }
        }
    };



});