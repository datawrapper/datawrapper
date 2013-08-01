

dw.theme = (function(){

    var __themes = {};

    var theme = {

        register: function(id) {
            var parent = arguments.length == 3 ? __themes[arguments[1]] : dw.theme.base,
                props = arguments[arguments.length - 1],
                theme = __themes[id] = {};

            _.extend(theme, parent, props);
        },

        get: function(id) {
            return __themes[id];
        }

    };

    return theme;

})();

