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

            // reload login form on homepage
            var homeLogin = $('#home-login');
            if (homeLogin.length > 0) {
                homeLogin.load('/xhr/home-login', null, function() {
                    DW.initializeSignUp();
                    DW.initializeLogout();
                });
            }
        },

        initializeSignUp: function() {

            function refreshSalt() {
                $.getJSON('/api/auth/salt', function(res) {
                   if (res.status == 'ok') {
                      $('#btn-register').data('salt', res.data.salt);
                      $('.btn-login').data('salt', res.data.salt);
                      $('.btn-login').data('time', res.data.time);
                   }
                });
            }

            $('a[href=#login]').click(function() {
                $('#dwLoginForm').modal();
                $('#dwLoginForm .alert').remove();

                var logEmail = $('#home-login .login-form .login-email'),
                    logPwd = $('#home-login .login-form .login-pwd');
                if (logEmail.val() !== '') $('#register-email').val(logEmail.val());
                if (logPwd.val() !== '') $('#register-pwd').val(logPwd.val());

                refreshSalt();
                return false;
            });

            refreshSalt();

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
                                DW.logMessage('Yeah, sign up went well! You are logged in now...', '.signup-form');
                                setTimeout(function() {
                                    $('#dwLoginForm').modal('hide');
                                    DW.refreshHeader();
                                }, 1000);
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

            function loginEvent(evt) {
                var loginForm = $(evt.target).parents('.login-form'),
                  lgBtn = $('.btn-login', loginForm),
                  hmac = CryptoJS.HmacSHA256,
                  pwd = $('.login-pwd', loginForm).val(),
                  hash = hmac(hmac(pwd, lgBtn.data('salt')).toString(), String(lgBtn.data('time'))).toString(),
                  payload = {
                     email: $('.login-email', loginForm).val(),
                     pwhash: hash,
                     time: lgBtn.data('time')
                  };
                $('.alert', loginForm).remove();

                $.ajax({
                    url: '/api/auth/login',
                    type: 'POST',
                    dataType: 'json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        if (data.status == "ok") {
                            $('#dwLoginForm').modal('hide');
                            $('input', loginForm).val('');
                            DW.refreshHeader();
                        } else {
                            DW.logError(data.message, loginForm);
                        }
                    }
                });
            }

            // log in on login button click
            $('.btn-login').click(loginEvent);
            // log in on email,pwd enter press
            $('.login-form input').keyup(function(evt) {
                if (evt.keyCode == 13) loginEvent(evt);
            });

        },

        initializeLogout: function() {
            $('a[href=#logout]').click(function() {
                $.ajax({
                    url: '/api/auth/logout',
                    type: 'POST',
                    success: function(data) {
                        // DW.refreshHeader();
                        // sometimes it's a good idea to redirect
                        location.href = '/';
                    }
                });
                return false;
            });
        },

        logMessage: function(msg, parent, type) {
            if (_.isString(parent)) parent = $(parent);
            if (type === undefined) type = 'success';
            var alert = $('<div class="alert alert-'+type+'" />');
            alert.append('<a class="close" data-dismiss="alert" href="#">&times;</a>');
            alert.append('<div>'+msg+'</div>');
            parent.prepend(alert);
            $(".alert").alert();
        },

        logError: function(msg, parent) {
            this.logMessage(msg, parent, 'error');
        }
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

    // Datawrapper.ChartData
    // ---------------------

    // represents the data for a chart. Usage:
    // new Datawrapper.ChartData({
    //     url: '/chart/Tjd67/data',
    //     autoload: true,
    //     success: function(data) {
    //         data.transpose(true);
    //         console.log(data.dataset);
    //     }
    // });

    var ChartData = Datawrapper.ChartData = function(opts) {
        this.url = opts.url;
        this.transpose = opts.transpose && opts.transpose === true;
        this.__valid = false;
        if (opts.autoload) this.load(opts.success);
    };

    _.extend(ChartData.prototype, {

        load: function(callback) {
            $.ajax({
                url: this.url,
                context: this,
                success: function(res) {
                    this.__rawDataString = res;
                    this.parse();
                    if (_.isFunction(callback)) callback(this);
                }
            });
        },

        transpose: function(trueOrNot) {
            if (trueOrNot === undefined) trueOrNot = true;
            if (trueOrNot !== this.transpose) {
                this.transpose = trueOrNot;
                this.changed = true;
                this.__valid = false;
            }
        },

        // returns a Miso.Dataset instance of this data
        dataset: function() {
            if (this.__valid) return this.__dataset;
            var ds = Miso.Dataset({
                data: data
            });
            ds.fetch();
            this.__valid = true;
            this.__dataset = ds;
            return ds;
        },

        // -- private functions

        // converts rawDataString into 2-d array
        parse: function(delimiter) {
            var delimiters = [',','\t',';'],
                rows = this.__rawDataString.split('\n'),
                rawData = [];

            if (delimiter === undefined) {
                delimiter = this.guessDelimiter(rows);
            }
            _.each(rows, function(row) {
                rawData.push(row.split(delimiter));
            });
            this.__rawData = rawData;
        },

        // automagically guess delimiter. uses a very simple algorithm.
        guessDelimiter: function(rows) {
            // find delimiter which occurs most often
            var maxDelimiterCount = 0, k = -1;
            _.each(delimiters, function(d, i) {
                var c = rows[0].split(d).length;
                if (c > maxDelimiterCount) {
                    maxDelimiterCount = c;
                    k = i;
                }
            });
            // verify that the file has a valid structure
            _.each(rows, function(row, i) {
                if (i < 5) {
                    if (row.split(delimiters[k]) != maxDelimiterCount) {
                        throw 'Could not guess csv delimiter';
                    }
                }
            });
            delimiter = delimiters[k];
        }
    });

    // -- now run datawrapper core
    $(function() {
        window.DW = new Datawrapper.Core();
    });


}).call(this);