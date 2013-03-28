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
        Datawrapper = root.Datawrapper = { Parsers: {} };
    }

    // Datawrapper.Core
    // ----------------

    var Core = Datawrapper.Core = function() {
    };

    _.extend(Core, {

        initialize: function() {
            this.initLanguageLinks();
        },

        initLanguageLinks: function() {
            $('a[href|=#lang]').click(function(evt) {
                evt.preventDefault();
                $.ajax({
                    url: '/api/account/lang',
                    type: 'PUT',
                    data: JSON.stringify({ lang: $(evt.target).attr('href').substr(6) }),
                    processData: false,
                    success: function(data) {
                        location.reload();
                    }
                });
            });
        }

    });



}).call(this);