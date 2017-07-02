
define(['queue'], function(queue) {

    var prefix = {
        xmlns: "http://www.w3.org/2000/xmlns/",
        xlink: "http://www.w3.org/1999/xlink",
        svg: "http://www.w3.org/2000/svg"
    };

    var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

    return function(iframe, chart_id, callback) {
        
        var t0 = (new Date()).getTime();
        // console.log('snapshot!');

        var iframeDoc = iframe.get(0).contentDocument;
        if (!iframeDoc) return;
        
        var chartBody = iframeDoc.querySelector('.dw-chart-body');

        if (!chartBody) {
            // console.warn('Please add class dw-chart-body', chart.get('theme'));
            chartBody = iframe.get(0).contentDocument.getElementById('chart');
        }

        if (!chartBody) return; // chart probably re-loading at this moment

        // count dom nodes
        var numDomNodes = chartBody.querySelectorAll('*').length,
            deferred = numDomNodes > 5000,
            serverSide = numDomNodes > 2000;

        // console.log(numDomNodes,'dom nodes', deferred, serverSide);

        // if (stop) return;

        // console.log('snapshot.js - start');

        chartToSvg(chartBody, function(svg) {
            // console.log('snapshot.js - chartToSVG', ((new Date()).getTime() - t0)/1000);

            var bbox = svg.node().getBoundingClientRect();

            var svg_src = svg.node().innerHTML;
            // remove url fills
            svg_src = svg_src.replace(/fill="url\([^\)]+\)"/g, 'fill="#cccccc"')
                        .replace(/<pattern.*<\/pattern>/g, '');

            svg.remove();

            (serverSide ? svgToPngServer : svgToPngClient)(svg_src, bbox, function(err) {
                // console.log('done', serverSide, err);
                // console.log('snapshot.js! total', ((new Date()).getTime() - t0)/1000);
            });
            // 
        });

        function svgToPngServer(svg_src, bbox, callback) {
            $.ajax({
                url: '/api/plugin/snapshot',
                type: 'POST',
                data: JSON.stringify({
                    svg: svg_src,
                    chart_id: chart_id,
                    thumb_id: 'm',
                    width: bbox.width,
                    height: bbox.height
                }),
                dataType: 'json',
                processData: false,
                success: function(res) {
                    // console.log(res);
                    if (res.status == "ok") callback(null);
                    else callback(res);
                }
            });
        }

        function svgToPngClient(svg_src, bbox, callback) {
            var canvas = document.createElement("canvas"),
                ctx = canvas.getContext("2d");

            canvas.width = bbox.width * 2;
            canvas.height = bbox.height * 2;

            ctx.drawSvg(svg_src, 0, 0, bbox.width * 2, bbox.height * 2);
            // document.body.appendChild(canvas);

            var imgData = canvas.toDataURL("image/png");

            $.ajax({
                url: '/api/charts/' + chart_id + '/thumbnail/m',
                type: 'PUT',
                data: imgData,
                processData: false,
                success: function(res) {
                    if (res.status == "ok") callback(null);
                    else callback(res);
                }
            });
        }

        function chartToSvg(parent_n, callback) {

            var parent = d3.select(parent_n),
                offsetTop = parent_n.getBoundingClientRect().top - parent_n.parentNode.getBoundingClientRect().top;

            var out_w = Math.min(parent_n.clientWidth, 700),
                out_h = Math.min(parent_n.clientHeight, 1000);

            var labels = parent.selectAll('.label span,.chart-title,.chart-intro,.footer-left,td,th'),
                nodes = parent.selectAll('path, line, rect, circle, text'),
                divs = parent.selectAll('.export-rect,.dw-rect,tr'),
                circles = parent.selectAll('.dw-circle'),
                lines = parent.selectAll('.dw-line'),
                arrows = parent.selectAll('.dw-arrow');

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

            var q = queue(500);

            var out_nodes = out_g.append('g#nodes'),
                out_text = out.append('g#text');

            nodes.each(function() { q.defer(addNode, this); });
            divs.each(function() { q.defer(addDiv, this); });
            circles.each(function() { q.defer(addDivCircle, this); });
            lines.each(function() { q.defer(addDivLine, this); });
            arrows.each(function() { q.defer(addDivArrow, this); });
            labels.each(function() { q.defer(addLabel, this); });

            q.awaitAll(function(err) {
                // console.log('all done', err);
                callback(cont);
            });

            function addNode(el, cb) {
                if (deferred) setTimeout(add, 0); else add();
                function add() {
                    var cur = el,
                        curCSS,
                        bbox,
                        transforms = [];
                    while (cur) {
                        curCSS = window.getComputedStyle(cur);
                        if (cur.nodeName == 'defs') return cb(null);
                        if (cur.nodeName != 'svg') {
                            // check node visibility
                            transforms.push(attr(cur, 'transform'));
                            cur = cur.parentNode;
                        } else {
                            bbox = cur.getBoundingClientRect();
                            transforms.push('translate('+[bbox.left, bbox.top]+')');
                            cur = null;
                        }
                        if (isHidden(curCSS)) return cb(null);
                    }
                    transforms = _.filter(transforms, _.identity).reverse();
                    transforms.unshift('translate(0,'+(-offsetTop)+')');
                    var cloned = el.cloneNode(true);
                    cloned.setAttribute('transform', transforms.join(' '));

                    // copy all computed style attributes
                    explicitlySetStyle(el, cloned);
                    out_nodes.node().appendChild(cloned);
                    cb(null);
                }
            }

            function addDiv(el, cb) {
                if (deferred) setTimeout(add, 0); else add();
                function add() {
                    var css = window.getComputedStyle(el),
                        bbox = el.getBoundingClientRect(),
                        stroke = css.borderColor,
                        strokeW = css.borderWidth,
                        opacity =  css.opacity,
                        fill = css.backgroundColor;

                    out_nodes.append('rect')
                        .style('fill', fill)
                        .style('opacity', opacity)
                        .style('stroke', stroke)
                        .style('stroke-width', strokeW)
                        .attr({ x: bbox.left, y: bbox.top-offsetTop })
                        .attr({ width: bbox.width, height: bbox.height });
                    cb(null);
                }
            }

            function addDivCircle(el, cb) {
                if (deferred) setTimeout(add, 0); else add();
                function add() {
                    var css = window.getComputedStyle(el),
                        bbox = el.getBoundingClientRect(),
                        stroke = css.borderColor,
                        strokeW = css.borderWidth,
                        opacity =  css.opacity,
                        fill = css.backgroundColor,
                        r = bbox.width * 0.5;

                    out_nodes.append('circle')
                        .style('fill', fill)
                        .style('opacity', opacity)
                        .style('stroke', stroke)
                        .style('stroke-width', strokeW)
                        .attr({ cx: bbox.left + r, cy: bbox.top-offsetTop + r })
                        .attr('r', r);
                    cb(null);
                }
            }

            function addDivLine(el, cb) {
                if (deferred) setTimeout(add, 0); else add();
                function add() {
                    var css = window.getComputedStyle(el),
                        bbox = el.getBoundingClientRect(),
                        len = bbox.width,
                        path = 'M'+[bbox.left,bbox.top-offsetTop]+'h'+len,
                        opacity =  css.opacity,
                        stroke = css.borderTopColor;

                    out_nodes.append('path')
                        .style('fill', 'none')
                        .style('opacity', opacity)
                        .style('stroke', stroke)
                        .style('stroke-linejoin', 'round')
                        .style('stroke-lineend', 'round')
                        .style('stroke-width', 1)
                        .attr('d', path);

                    cb(null);
                }
            }

            function addDivArrow(el, cb) {
                if (deferred) setTimeout(add, 0); else add();
                function add() {
                    var css = window.getComputedStyle(el),
                        bbox = el.getBoundingClientRect(),
                        dir = el.classList.contains('dw-arrow-left') ? 'left' : 'right',
                        len = bbox.width,
                        y = bbox.top + bbox.height * 0.5 - offsetTop,
                        h = 5,
                        path = dir == 'right' ?
                            'M'+[bbox.left,y]+'h'+len+' l'+[-5,-5]+'l'+[5,5]+'l'+[-5,5]+'l'+[5,-5] :
                            'M'+[bbox.left+len,y]+'h'+(-len)+' l'+[5,-5]+'l'+[-5,5]+'l'+[5,5]+'l'+[-5,-5],
                        opacity =  css.opacity,
                        fill = css.backgroundColor,
                        r = bbox.width * 0.5;

                    out_nodes.append('path.arrow')
                        .style('fill', 'none')
                        .style('opacity', opacity)
                        .style('stroke', fill)
                        .style('stroke-linejoin', 'round')
                        .style('stroke-lineend', 'round')
                        .style('stroke-width', 2)
                        .attr('d', path);

                    cb(null);
                }
            }


            function addLabel(el, cb) {
                if (deferred) setTimeout(add, 0); else add();
                function add() {
                    // create a text node for each label
                    var cur = el,
                        bbox = el.getBoundingClientRect(),
                        align = 'left',
                        content = el.innerText ? el.innerText.replace('&nbsp;', ' ') : el.textContent.replace('&nbsp;', ' '),
                        transforms = [];

                    var txt = out_text.append('text')
                        .text(content)
                        .attr({ x: bbox.left });

                    copyTextStyles(el, txt.node());

                    txt.attr('y', bbox.top - offsetTop + 2)
                        .style('dominant-baseline', 'hanging');
                    cb(null);
                }
            }

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
    };


});
