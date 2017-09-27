define(function(require) {
    return function(href, variable) {
        var vars = href.slice(href.lastIndexOf('?') + 1).split('&');

        return vars.reduce(function(old, cur) {
            if (old)
                return old;
            else {
                var pair = cur.split('=');
                return (decodeURIComponent(pair[0]) == variable) ? decodeURIComponent(pair[1]) : old;
            }
        }, false);
    };
});
