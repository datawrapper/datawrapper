var page = require('webpage').create(),
    system = require('system'),
    address, output, size, format, orient;



if (system.args.length < 3 || system.args.length > 5) {
    console.log('Usage: export_chart.js URL filename [format]');
    phantom.exit(1);
} else {
    address = system.args[1];
    output = system.args[2];
    format = system.args[3];

    if (output.substr(-4) === ".pdf") {
        page.viewportSize = {
            'landscape': { width: 1500, height: 1050 },
            'portrait': { width: 1150, height: 1300 },
            'square': { width: 1300, height: 1200 }
        }[format];
        page.paperSize = {
            'landscape': { width: '27cm', height: '20cm' },
            'portrait': { width: '24cm', height: '27cm' },
            'square': { width: '27cm', height: '27cm' }
        }[format];
        page.zoomFactor = 1.2;
    } else {
        page.zoomFactor = 2;
        page.viewportSize = {
            'landscape': { width: 1600, height: 1200 },
            'portrait': { width: 1300, height: 1600 },
            'square': { width: 1500, height: 1500 }
        }[format];
    }

    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('Unable to load the address!');
            phantom.exit();
        } else {
            window.setTimeout(function () {
                page.render(output);
                phantom.exit();
            }, 200);
        }
    });
}
