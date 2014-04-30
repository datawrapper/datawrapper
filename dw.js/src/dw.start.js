//
// NOTE: This file is auto-generated using /dw.js/make
// from the source files /dw.js/src/*.js.
//
// If you want to change anything you need to change it
// in the source files and then re-run /dw.js/make, or
// otherwise your changes will be lost on the make.
//

(function(){

    var root = this,
        dw = {};

    // if (typeof 'define' !== 'undefined' && define.amd) {
    //     // make define backward compatible
    //     root.dw = dw;
    //     define(dw);
    // } else
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = dw;
        }
        exports.dw = dw;
    } else {
        window.dw = dw;
    }
