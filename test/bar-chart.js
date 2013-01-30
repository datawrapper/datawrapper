
var test = require('tape');

test('bar chart', function (t) {
    t.equal(2 + 2, 4);

    t.log(window.navigator.appName);

    t.createWindow('http://dev.datawrapper.de/chart/TPuVC/', { t : t }, function (win, $) {
        t.equal(win.document.title, 'Nettoneuverschuldung');
        t.equal($('rect').length, 10);
        t.equal($('.label').length, 28);
        t.end();
    });
});
