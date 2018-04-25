/* globals dw,$,_*/
// visualize/themes

define(function() {

    var themesById = {},
        themes,
        chart = dw.backend.currentChart;

    function init(_themes) {
        _.each(_themes, function(theme) {
            themesById[theme.id] = theme;
            dw.theme.register(theme.id, theme.data);
        });

        themes = _themes;
    }

    function showThemeColors() {
        var theme_id = chart.get('theme'),
            theme = dw.theme(theme_id);

        chart.set('metadata.publish.background', theme.colors.background);
        chart.set('metadata.publish.contextBg', theme.colors.contextBackground);
        chart.set('metadata.publish.text', theme.colors.text);

    }

    return {
        init: init,
        all: function() { return themes; },
        updateUI: showThemeColors
    };

});
