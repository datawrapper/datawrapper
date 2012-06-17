//      Datawrapper
(function(){

    // Initial Setup
    // -------------
    var root = this;

    // The top-level namespace. All public Backbone classes and modules will be
    // attached to this. Exported for both CommonJS and the browser.
    var Datawrapper;
    if (typeof exports !== 'undefined') {
        Datawrapper = exports;
    } else {
        Datawrapper = root.Datawrapper = {};
    }

    // Current version of the library
    Datawrapper.VERSION = '0.2.1';


    // Datawrapper.Core
    // ----------------

    var Core = Datawrapper.Core = function() {

        this.initialize();

    };

    _.extend(Core.prototype, {

    });



}).call(this);