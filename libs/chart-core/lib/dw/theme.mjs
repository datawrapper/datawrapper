const __themes = {};

function theme(id) {
    return __themes[id];
}

theme.register = function(id, props) {
    __themes[id] = props;
};

export default theme;
