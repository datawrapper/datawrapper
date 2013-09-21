var page = require('webpage').create(),
    system = require('system'),
    address, output, chart_id;

var fs = require('fs');


if (system.args.length < 3 || system.args.length > 5) {
    console.log('Usage: make_thumb.js url file width height');
    phantom.exit(1);

} else {
    url = system.args[1];
    output = system.args[2];

    if (output.substr(output.length-1) != '/') output += '/';

    if (!fs.isWritable(output)) {
        console.log('Cannot write to '+output);
        phantom.exit();
    }

    page.zoomFactor = 1;
    page.viewportSize = { width: system.args[3], height: system.args[4] };

    page.open(url, function (status) {
        if (status !== 'success') {
            console.log('Unable to load the address!');
            phantom.exit();
        } else {
            var texts = page.evaluate(function() {
                var r = [], title = "";
                $('h1, .footer-left, .footer-right, p').css('opacity', 0).each(function(i, el) {
                    el = $(el);
                    if (el.css('opacity') === 0 || el.is(':hidden')) return;
                    r.push({
                        txt: el.html(),
                        x: el.offset().left,
                        y: el.offset().top,
                        w: el.width(),
                        h: el.height(),
                        fs: el.css('font-size'),
                        fn: el.css('font-family'),
                        col: el.css('color'),
                        ta: el.css('text-align')
                    });
                    if (el.get(0).nodeName.toLowerCase() == "h1") {
                        title = $('span', el).html() || el.html();
                    }
                });
                return [r, title];
            });
            // write static.html
            var html = "<html><head><title>" + texts[1] + "</title><style type='text/css'>";
            html += "body { background: url(static.png) top left no-repeat; }\n";
            html += "</style></head><body>";
            for (var i = 0; i < texts[0].length; i++) {
                var t = texts[0][i];
                html += '<div style="position:absolute;left:'+t.x+'px;top:'+t.y+'px;width:'+t.w+'px;';
                html += 'height:'+t.h+'px;font-size:'+t.fs+';font-family:'+t.fn+';color:'+t.col+';';
                html += 'text-align:'+t.ta+';">'+t.txt+'</div>';
            }
            html += "</body></html>";

            // render chart as PNG
            window.setTimeout(function () {
                // render static.png
                page.render(output + 'static.png');
                // render nojs.png
                page.evaluate(function() {
                    $('h1, #footer, p').remove();
                });
                page.render(output + 'nojs.png');
                fs.write(output + 'static.html', html, 'w');

                phantom.exit();
            }, 500);

        }
    });
}
