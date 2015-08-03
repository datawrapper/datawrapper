
define(function() {

    var prefix = {
        xmlns: "http://www.w3.org/2000/xmlns/",
        xlink: "http://www.w3.org/1999/xlink",
        svg: "http://www.w3.org/2000/svg"
    };

    var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

    return function(iframe, chart_id, thumb_id, width, height, callback) {
        
        console.log('snapshot.js!');

        var chartBody = iframe.get(0).contentDocument.querySelector('.dw-chart-body');

        if (!chartBody) {
            console.warn('Please add class dw-chart-body to theme', chart.get('theme'));
            chartBody = iframe.get(0).contentDocument.getElementById('chart');
        }

        var svg = chartToSvg(chartBody);

        var bbox = svg.node().getBoundingClientRect();

        var canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d");

        canvas.width = bbox.width * 2;
        canvas.height = bbox.height * 2;

        var svg_src = svg.node().innerHTML;
        // remove url fills
        svg_src = svg_src.replace(/fill="url\([^\)]+\)"/g, 'fill="#cccccc"')
                    .replace(/<pattern.*<\/pattern>/g, '');
        ctx.drawSvg(svg_src, 0, 0, bbox.width * 2, bbox.height * 2);

        // document.body.appendChild(canvas);

        var imgData = canvas.toDataURL("image/png");

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

        svg.remove();

    };

    function chartToSvg(parent_n) {

        var parent = d3.select(parent_n),
            offsetTop = parent_n.getBoundingClientRect().top - parent_n.parentNode.getBoundingClientRect().top;

        var out_w = parent_n.clientWidth,
            out_h = parent_n.clientHeight;

        var labels = parent.selectAll('.label span,.chart-title,.chart-intro,.footer-left'),
            nodes = parent.selectAll('path, line, rect, circle, text'),
            divs = parent.selectAll('.export-rect,.dw-rect');

        var svgNodes = parent.selectAll('svg');

        d3.select('body').selectAll('.dw-snapshot').remove();

        // 1. create a new svg container of the size of the page
        var cont = d3.select('body').append('div.dw-snapshot'),
            out = cont.append('svg');

        // get empty css declaration
        var emptyCSS = window.getComputedStyle(out.node());

        out.attr({ width: out_w, height: out_h });
        cont.style({ position: 'absolute', left: '-5020px', top: '20px' });

        var out_g = out.append('g').attr('id', 'graphic');

        nodes.each(function() {
            var el = this,
                cur = el,
                curCSS,
                bbox,
                transforms = ['translate(0,'+(-offsetTop)+')'];
            while (cur) {
                curCSS = getComputedStyle(cur);
                if (cur.nodeName == 'defs') return;
                if (cur.nodeName != 'svg') {
                    // check node visibility
                    transforms.push(attr(cur, 'transform'));
                    cur = cur.parentNode;
                } else {
                    bbox = cur.getBoundingClientRect();
                    transforms.push('translate('+[bbox.left, bbox.top]+')');
                    cur = null;
                }
                if (isHidden(curCSS)) return;
            }
            transforms = _.filter(transforms, _.identity).reverse();
            var cloned = el.cloneNode(true);
            cloned.setAttribute('transform', transforms.join(' '));

            // copy all computed style attributes
            explicitlySetStyle(el, cloned);
            out_g.node().appendChild(cloned);
        });

        console.log(divs, parent);

        divs.each(function() {
            var el = this,
                css = getComputedStyle(el),
                bbox = el.getBoundingClientRect(),
                stroke = css.borderColor,
                strokeW = css.borderWidth,
                fill = css.backgroundColor;

            var rect = out_g.append('rect')
                .style('fill', fill)
                .style('stroke', stroke)
                .style('stroke-width', strokeW)
                .attr({ x: bbox.left, y: bbox.top-offsetTop })
                .attr({ width: bbox.width, height: bbox.height });

        });

        out_g = out.append('g').attr('id', 'text');

        labels.each(function() {
            // create a text node for each label
            var el = this,
                cur = el,
                bbox = el.getBoundingClientRect(),
                align = 'left',
                content = el.innerText,
                transforms = [];

            var txt = out_g.append('text')
                .text(content)
                .attr({ x: bbox.left });

            copyTextStyles(el, txt.node());

            txt.attr('y', bbox.top - offsetTop + 2)
                .style('dominant-baseline', 'hanging');

            // bbox = txt.node().getBoundingClientRect();
            // txt.attr('y', bbox.top+bbox.height-offsetTop).style('dominant-baseline', 'text-after-edge');
        });

        return cont;

        function isHidden(css) {
            return css.display == 'none' ||
                css.visibility == 'hidden' ||
                +css.opacity === 0 ||
                    (+css.fillOpacity === 0 || css.fill == 'none') &&
                    (css.stroke == 'none' || !css.stroke || +css.strokeOpacity === 0);
        }

        function explicitlySetStyle(element, target) {
            var elCSS = getComputedStyle(element),
                i, len, key, value,
                computedStyleStr = "";
            for (i=0, len=elCSS.length; i<len; i++) {
                key=elCSS[i];
                value=elCSS.getPropertyValue(key);
                if (value!==emptyCSS.getPropertyValue(key)) {
                    computedStyleStr+=key+":"+value+";";
                }
            }
            target.setAttribute('style', computedStyleStr);
        }

        function copyTextStyles(element, target) {
            var elCSS = getComputedStyle(element),
                i, len, key, value,
                computedStyleStr = "";
            for (i=0, len=elCSS.length; i<len; i++) {
                key=elCSS[i];
                if (key.substr(0,4) == 'font' || key.substr(0,4) == 'text' || key == 'color') {
                    value=elCSS.getPropertyValue(key);
                    if (key == 'color') key = 'fill';
                    if (value!==emptyCSS.getPropertyValue(key)) {
                        computedStyleStr+=key+":"+value+";";
                    }
                }
            }
            target.setAttribute('style', computedStyleStr);
        }

        function download(svg, filename) {
            var source = (new XMLSerializer()).serializeToString(svg);
            var url = window.URL.createObjectURL(new Blob([doctype + source], { "type" : "text\/xml" }));

            var a = document.createElement("a");
            document.body.appendChild(a);
            a.setAttribute("class", "svg-crowbar");
            a.setAttribute("download", filename + ".svg");
            a.setAttribute("href", url);
            a.style.display = "none";
            a.click();

            setTimeout(function() {
                window.URL.revokeObjectURL(url);
            }, 10);
        }


        function attr(n, v) { return n.getAttribute(v); }

    }



    // /*
    //  * creates a client-side PNG snapshop of a chart in a given iframe
    //  * and sends it to the Datawrapper API right after
    //  */
    // return function(iframe, chart_id, thumb_id, width, height, callback) {

    //   // add empty svg element
    //     var emptySvg = window.document.createElementNS(prefix.svg, 'svg');
    //     emptySvg.setAttribute('width', 1);
    //     emptySvg.setAttribute('height', 1);
    //     window.document.body.appendChild(emptySvg);
    //     var emptySvgDeclarationComputed = getComputedStyle(emptySvg);

    //     function px(s) { return Math.floor(Number(s.substr(0, s.length-2))); }

    //     var body = iframe.get(0).contentDocument,
    //         win = iframe.get(0).contentWindow,
    //         vis = win.__dw ? win.__dw.vis : false;

    //     if (!vis || !vis._svgCanvas()) return false;

    //     var c = win.__dw.vis.__canvas,
    //         x = c.lpad + (c.lpad2 || 0),
    //         y = 0,
    //         w = c.w - x - c.rpad,
    //         h = c.h - y - c.bpad,
    //         scale = Math.max(width / c.w, height / c.h);

        // var canvas = document.createElement("canvas"),
        //     ctx = canvas.getContext("2d");


        // canvas.width = c.w * scale;
        // canvas.height = c.h * scale;

    //     ctx.fillStyle = win.__dw.vis.theme().colors.background;
    //     ctx.fillRect(0, 0, c.w * scale, c.h * scale);
    //     var svg = vis._svgCanvas();

    //     setInlineStyles(svg);

        // var svg_src = svg.innerSVG;
        // // remove url fills
        // svg_src = svg_src.replace(/fill="url\([^\)]+\)"/g, 'fill="#cccccc"')
        //             .replace(/<pattern.*<\/pattern>/g, '');
        // ctx.drawSvg(svg_src, 0, 0, c.w * scale, c.h * scale);

    //     var tempCanvas = document.createElement("canvas"),
    //         tCtx = tempCanvas.getContext("2d");

    //     tempCanvas.width = width;
    //     tempCanvas.height = height;

    //     tCtx.drawImage(canvas, -x + (width - c.w * scale) * 0.5, -y);


    //     window.document.body.removeChild(emptySvg);

    //     function setInlineStyles(svg) {
    //         function explicitlySetStyle (element) {
    //             var cSSStyleDeclarationComputed = getComputedStyle(element);
    //             var i, len, key, value;
    //             var computedStyleStr = "";
    //             for (i=0, len=cSSStyleDeclarationComputed.length; i<len; i++) {
    //                 key=cSSStyleDeclarationComputed[i];
    //                 value=cSSStyleDeclarationComputed.getPropertyValue(key);
    //                 if (value!==emptySvgDeclarationComputed.getPropertyValue(key)) {
    //                     computedStyleStr+=key+":"+value+";";
    //                 }
    //             }
    //             element.setAttribute('style', computedStyleStr);
    //         }
    //         function traverse(obj){
    //             var tree = [];
    //             tree.push(obj);
    //             visit(obj);
    //             function visit(node) {
    //                 if (node && node.hasChildNodes()) {
    //                     var child = node.firstChild;
    //                     while (child) {
    //                         if (child.nodeType === 1 && child.nodeName != 'SCRIPT'){
    //                             tree.push(child);
    //                             visit(child);
    //                         }
    //                         child = child.nextSibling;
    //                     }
    //                 }
    //             }
    //             return tree;
    //         }
    //         // hardcode computed css styles inside svg
    //         var allElements = traverse(svg);
    //         var i = allElements.length;
    //         while (i--){
    //             explicitlySetStyle(allElements[i]);
    //         }
    //     }
    // };



});