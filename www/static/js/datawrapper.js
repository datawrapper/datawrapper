//      Datawrapper Sync

(function(){

    // Initial Setup
    // -------------

    // Save a reference to the global object (`window` in the browser, `global`
    // on the server).
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
    Datawrapper.VERSION = '0.1.1';

    // Require Underscore, if we're on the server, and it's not already present.
    var _ = root._;

    // Require jQuery, Zepto, or Ender.
    var $ = root.jQuery || root.Zepto || root.ender;


    // Datawrapper.Core
    // ----------------

    var Core = Datawrapper.Core = function() {

        this.initialize();

    };

    _.extend(Core.prototype, {

        initialize: function() {

            $('#dw-header-link-login').click(function() {
                $('#dwLoginForm').modal();

                $.getJSON('/api/auth/salt', function(res) {
                   if (res.status == 'ok') {
                      $('#btn-register').data('salt', res.data.salt);
                   }
                });

                return false;
            });

            this.initializeSignUp();
        },

        checkPasswordStrength: function(pwd) {
            //return $.trim(pwd).length > 7;
            return true;
        },

        initializeSignUp: function() {
            $('#btn-register').click(function() {
               var pwd = $.trim($('#register-pwd').val()),
                   pwd2 = $.trim($('#register-pwd-2').val());

               if (pwd == pwd2) {
                  if (true) {
                     var payload = {
                        email: $('#register-email').val(),
                        pwd: CryptoJS.HmacSHA256(pwd, $('#btn-register').data('salt')).toString(),
                        pwd2: CryptoJS.HmacSHA256(pwd2, $('#btn-register').data('salt')).toString()
                     };
                     $.ajax({
                        url: '/api/users',
                        type: 'POST',
                        data: JSON.stringify(payload),
                        success: function(data) {
                           alert('OK! '+data);
                        }
                     });
                  } else {
                     alert('Error: password is to unsecure. please chose a password with at least 8 characters');
                  }
               } else {
                  alert('Error: password mismatch');
               }
            });
        }
    });

    new Datawrapper.Core();


    // Datawrapper.Chart
    // -----------------

    //
    var Chart = Datawrapper.Chart = function(attributes) {
        this.attributes = attributes;
    };

    _.extend(Chart.prototype, {

        sync: function(el, attribute) {
            el.data('sync-attribute', attribute);
            el.change(function(evt) {
                var el = $(evt.target),
                    attrs, pt;

                // Resolve attribute string to a pointer to the attribute
                attrs = el.data('sync-attribute').split('.');
                pt = this.attributes;
                _.each(attrs, function(key) {
                    pt = pt[key];
                });

                if (_.isObject(pt)) {
                    console.warn('Cannot sync a dictionary');
                } else {
                    if (el.is('input[type=checkbox]')) {
                        pt = el.attr('checked') == 'checked';
                    } else if (el.is('input[type=text]') || el.is('textarea') || el.is('select')) {
                        pt = el.val();
                    }
                }
            });
        }

    });

}).call(this);