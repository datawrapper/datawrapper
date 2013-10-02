
// visualize/themes

define(function() {

    var themesById = {},
        themes;

    function init(_themes) {
        _.each(_themes, function(theme) {
            themesById[theme.id] = theme;
            themesById[theme.id].__loaded = false;
        });
        themes = _themes;
    }

    function load() {
        var dfd = $.Deferred(),
            themeid = $('#select-theme').val(),
            theme = themesById[themeid],
            needed = [themeid];

        while (theme['extends']) {
            needed.unshift(theme['extends']);
            theme = themesById[theme['extends']];
        }
        function loadNext() {
            if (needed.length > 0) {
                var next = themesById[needed.shift()];
                if (!next.__loaded) {
                    next.__loaded = true;
                    $.getScript(next.__static_path + '/' + next.id + '.js', loadNext);
                } else {
                    loadNext();
                }
            } else {
                dfd.resolve();
                $('body').trigger('dw:themes-loaded');
            }
        }
        loadNext();
        return dfd.promise();
    }

    return {
        init: init,
        load: load,
        all: function() { return themes; }
    };

});