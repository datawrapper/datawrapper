var page = require('webpage').create(),
    system = require('system'),
    address, output, chart_id;

var fs = require('fs');


if (system.args.length < 3 || system.args.length > 5) {
    console.log('Usage: make_thumb.js url chart_id width height');
    phantom.exit(1);

} else {
    url = system.args[1];
    output = system.args[2];

    page.zoomFactor = 1;
    page.viewportSize = { width: system.args[3], height: system.args[4] };

    page.open(url, function (status) {
        if (status !== 'success') {
            console.log('Unable to load the address!');
            phantom.exit();
        } else {
            var texts = page.evaluate(function() {
                r = [], title = "";
                $('.label, h1, .footer-left, .footer-right').css('opacity', 0).each(function(i, el) {
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
                page.render(output + 'static.png');
                phantom.exit();
            }, 200);

            try {
                fs.write(output + 'static.html', html, 'w');
            } catch (e) {
                console.log(output + 'static.html' + ' is not writable!');
                //console.log(e);
                phantom.exit();
            }

        }
    });
}
