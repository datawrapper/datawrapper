
(function(){

    var root = this,
        dw = {};

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = dw;
        }
        exports.dw = dw;
    } else {
        window.dw = dw;
    }
