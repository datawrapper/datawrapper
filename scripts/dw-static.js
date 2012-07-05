#!/usr/bin/env phantomjs

var page = new WebPage(),
    address, output, size;

if (phantom.args.length < 2 || phantom.args.length > 5) {
    console.log('Usage: rasterize.js URL filename width height');
    phantom.exit();
} else {
    address = 'http://datawrapper/?c=' + phantom.args[0];
    output = phantom.args[1];
    width = phantom.args.length > 2 ? Number(phantom.args[2]) : 600;
    height = phantom.args.length > 3 ? Number(phantom.args[3]) : 400;

    page.viewportSize = { width: width, height: height };
    page.paperSize = { width: (width/35)+"cm", height: (height/35)+"cm" };

    console.log('loading datawrapper chart');
    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('Unable to load the address!');
        } else {
            page.injectJs("jquery.min.js");
            page.evaluate(function() {
                $('body').css({ background: '#fff '});
                $('#export_csv').hide(); // hide download button
                $('#show_desc').hide(); // hide info button
            });
            window.setTimeout(function () {
                page.clipRect = { top: 0, left: 0, width: width, height: height-25 };
                page.render(output);
                phantom.exit();
            }, 200);
        }
    });
}

