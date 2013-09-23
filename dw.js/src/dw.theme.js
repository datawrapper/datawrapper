

dw.theme = (function(){

    var __themes = {};

    var theme = function(id) {
        return __themes[id];
    };

    theme.register = function(id) {
        var parent = arguments.length == 3 ? __themes[arguments[1]] : dw.theme.base,
            props = arguments[arguments.length - 1];

        __themes[id] = $.extend(true, parent, { id: id }, props);
    };

    return theme;

})();

