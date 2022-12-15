const __themes = {};

function theme(id) {
    return __themes[id];
}

theme.register = function (id, themeData) {
    __themes[id] = themeData;
};

export default theme;
