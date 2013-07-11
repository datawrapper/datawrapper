
    // Require Underscore, if we're on the server, and it's not already present.
    var root = this;
    var _ = root._;
    var $ = root.jQuery || root.Zepto || root.ender;


    // Datawrapper.Utils
    // -----------------

    var Utils = Datawrapper.Utils = function() {

        this.initialize();

    };

    _.extend(Utils.prototype, {

        initialize: function() {
            this.initializeSignUp();
            this.initializeLogout();

            
            this.Errors = {};
        },

        checkPasswordStrength: function(pwd) {
            //return $.trim(pwd).length > 7;
            return true;
        },


    ,

        refreshHeader: function() {
            location.reload();
            return;
        },



    });



