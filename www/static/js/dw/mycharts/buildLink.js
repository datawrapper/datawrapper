define(function(require) {
    var twig = twig = require('./twig_globals');

    return function buildLink(id) {
        var link = '';

        link += (id.organization) ? '/team/' + id.organization : twig.globals.strings.mycharts_base;
        if (id.folder) { link += '/' + id.folder }
        return link;
    }
});