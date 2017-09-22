define(function(require) {
	var twig = require('./twig_globals')

    return function(org, path, tree) {
        var cwd, mypath,
            line = $('#folder-sequence'),
            sep = '<span class="sep">›</span>';

        mypath = Array.from(path);
        cwd = mypath.pop();

        mypath.forEach(function(dir) {
            var a = document.createElement('a'),
                folder;

            a.innerText = dw.utils.purifyHtml(dir, '');
            folder = tree.reduce(function(old, cur) {
                return (!old && cur.name === dir) ? cur : old;
            }, false);
            a.setAttribute('href', (org) ? '/organization/' + org.id + '/' + folder.id : twig.globals.strings.mycharts_base + '/' + folder.id);
            line.append(sep, a);
            tree = folder.sub
        });
        line.append(sep);
        $('#current-folder-name').html(dw.utils.purifyHtml(cwd, ''));
    };
});
