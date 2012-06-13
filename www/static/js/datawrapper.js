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
            this.initializeSignUp();
            this.initializeLogout();
        },

        checkPasswordStrength: function(pwd) {
            //return $.trim(pwd).length > 7;
            return true;
        },

        refreshHeader: function() {
            $.get('/xhr/header/create', function(header) {
                $('.header .toplinks').replaceWith(header);
                DW.initializeSignUp();
                DW.initializeLogout();
            });
        },

        initializeSignUp: function() {

            $('a[href=#login]').click(function() {
                $('#dwLoginForm').modal();
                $('#dwLoginForm .alert').remove();

                $.getJSON('/api/auth/salt', function(res) {
                   if (res.status == 'ok') {
                      $('#btn-register').data('salt', res.data.salt);
                      $('#btn-login').data('salt', res.data.salt);
                      $('#btn-login').data('time', res.data.time);
                   }
                });
                return false;
            });

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
                        dataType: 'json',
                        context: this,
                        success: function(data) {
                            if (data.status == 'ok') {
                                // If the registration went well, clear sign up form
                                $('.signup-form input').val('');
                                // and close popup. User should be logged in now.
                                DW.logMessage('Yeah, sign up went well.. You are logged in now...', '.signup-form');
                                setTimeout(function() {
                                    $('#dwLoginForm').modal().hide();
                                    DW.refreshHeader();
                                }, 4000);
                            } else {
                                DW.logError(data.code, '.signup-form');
                            }
                        }
                     });
                  } else {
                     alert('Error: password is to unsecure. please chose a password with at least 8 characters');
                  }
               } else {
                  alert('Error: password mismatch');
               }
            });

            $('#btn-login').click(function() {
                var lg = $('#btn-login'), hmac = CryptoJS.HmacSHA256,
                  pwd = $('#login-pwd').val(),
                  hash = hmac(hmac(pwd, lg.data('salt')).toString(), String(lg.data('time'))).toString(),
                  payload = {
                     email: $('#login-email').val(),
                     pwhash: hash,
                     time: $('#btn-login').data('time')
                  };
                $('#login-email').val('');
                $('#login-pwd').val('');
                $.ajax({
                    url: '/api/auth/login',
                    type: 'POST',
                    dataType: 'json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        if (data.status == "ok") {
                            $('#dwLoginForm').modal().hide();
                            $('.login-form input').val('');
                            DW.refreshHeader();
                        } else {
                            DW.logError(data.message, '.login-form');
                        }
                    }
                });
            });
        },

        initializeLogout: function() {
            $('a[href=#logout]').click(function() {
                $.ajax({
                    url: '/api/auth/logout',
                    type: 'POST',
                    success: function(data) {
                        DW.refreshHeader();
                    }
                });
                return false;
            });
        },

        logMessage: function(msg, parent, type) {
            $(parent).prepend(alert);
            if (type === undefined) type = 'success';
            var alert = $('<div class="alert alert-'+type+'" />');
            alert.append('<a class="close" data-dismiss="alert" href="#">&times;</a>');
            alert.append('<div>'+msg+'</div>');
            $(parent).prepend(alert);
            $(".alert").alert();
        },

        logError: function(msg, parent) {
            this.logMessage(msg, parent, 'error');
        }
    });

    $(function() {
        window.DW = new Datawrapper.Core();
    });


    // Datawrapper.Chart
    // -----------------

    //
    var Chart = Datawrapper.Chart = function(attributes) {
        this.attributes = attributes;
    };

    _.extend(Chart.prototype, {

        get: function(key) {
            var keys = key.split('.'),
                pt = this.attributes;

            _.each(keys, function(key) {
                pt = pt[key];
            });
            return pt;
        },

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