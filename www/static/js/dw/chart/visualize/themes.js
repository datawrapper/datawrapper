
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
                dw.backend.fire('all-themes-loaded');
                showThemeColors();
            }
        }
        loadNext();
        return dfd.promise();
    }

    function showThemeColors() {
        var themeid = $('#select-theme').val(),
            customColors = $('#palette-colors'),
            theTheme = dw.theme(themeid),
            picker = $('#select-color');
        picker.data('colors', theTheme.colors.palette.join(','));
        picker.data('color', theTheme.colors.palette[chart.get('metadata.visualize.base-color', 0)]);
        picker.colorpicker({
            maxW: $('.tab-container').width()*0.5,
            change: function(color) {
                var colIndex = theTheme.colors.palette.join(',').toLowerCase().split(',').indexOf(color.toLowerCase());
                chart.set('metadata.visualize.base-color', colIndex);
            }
        });
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