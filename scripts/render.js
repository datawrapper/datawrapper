#!/usr/bin/env phantomjs

var page = new WebPage(),
    address, output, size, format;

if (phantom.args.length < 2 || phantom.args.length > 5) {
    console.log('Usage: render.js chart-id outfile width height');
    phantom.exit();
} else {
    output = phantom.args[1];
    format = output.substr(-3);
    address = phantom.args[0];
    width = phantom.args.length > 2 ? Number(phantom.args[2]) : 600;
    height = phantom.args.length > 3 ? Number(phantom.args[3]) : 400;

    page.viewportSize = { width: width, height: height };
    page.paperSize = { width: (width/35)+"cm", height: (height/35)+"cm" };

    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('Unable to load the address!');
        } else {

            window.setTimeout(function () {
                page.clipRect = { top: 0, left: 0, width: width, height: height };
                page.render(output);
                phantom.exit();
            }, 200);
        }
    });
}
