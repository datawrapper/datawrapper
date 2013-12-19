
// visualize/themes

define(function() {

    var themesById = {},
        themes,
        chart = dw.backend.currentChart;

    function init(_themes) {
        _.each(_themes, function(theme) {
            themesById[theme.id] = theme;
            themesById[theme.id].__loaded = false;
        });
        themes = _themes;
    }

    /*
     * loads the currently selected theme and all its parent themes
     * returns a promise that is resolved as the loading is complete
     */
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
                dw.backend.fire('theme-loaded');
                dfd.resolve();
                showThemeColors();
            }
        }
        loadNext();
        return dfd.promise();
    }

    function showThemeColors() {
        var themeid = $('#select-theme').val(),
            customColors = $('#palette-colors'),
        chart.set('metadata.publish.background', theTheme.colors.background);
        chart.set('metadata.publish.contextBg', theTheme.colors.contextBackground);
        chart.set('metadata.publish.text', theTheme.colors.text);

        var colors = theTheme.colors.palette.slice().concat(theTheme.colors.secondary || []);
        customColors.data('colors', colors.join(','));
    }

    return {
        init: init,
        load: load,
        all: function() { return themes; },
        updateUI: showThemeColors
    };

});