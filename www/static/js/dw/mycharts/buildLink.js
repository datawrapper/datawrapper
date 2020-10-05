define(function (require) {
    var twig = require('./twig_globals');

    return function buildLink(id, page) {
        var link = '';

        link += id.organization ? '/team/' + id.organization : twig.globals.strings.mycharts_base;
        if (id.folder) {
            link += '/' + id.folder;
        }
        return link + (page ? (link.indexOf('?') > -1 ? '&' : '?') + 'page=' + page : '');
    };
});
