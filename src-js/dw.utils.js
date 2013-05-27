// Datawrapper
(function(){

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

            $('a[data-toggle=modal]').click(function(e) {
                var a = $(e.target),
                    tgt = $(a.data('target'));
                tgt.modal();
            });

            this.Errors = {};
        },

        checkPasswordStrength: function(pwd) {
            //return $.trim(pwd).length > 7;
            return true;
        },

        checkPassword: function(curPwd, pwd, pwd2) {
            var msg, errFields;
            if (curPwd === '') {
                errFields = '#cur-pwd';
                msg = Datawrapper.Messages.provideCurPwd;
            }
            else if (pwd.length < 4) {
                errFields = '#pwd';
                msg = Datawrapper.Messages.pwdTooShort;
            }
            else if (pwd != pwd2) {
                errFields = '#pwd,#pwd2';
                msg = Datawrapper.Messages.pwdMismatch;
            }
            if (msg) {
                DW.logError(
                    msg, $(errFields.split(',')[0]).parents('.control-group')
                );
                $(errFields).parents('.control-group').addClass('error');
                return false;
            }
            return true;
        },

        clearAlerts: function () {
            $('.alert').remove();
            $('.error').removeClass('error');
        },

        refreshHeader: function() {
            location.reload();
            return;
        },

        initializeSignUp: function() {

            function refreshSalt() {
                $.getJSON('/api/auth/salt', function(res) {
                   if (res.status == 'ok') {
                      $('#btn-register, .btn-login').data('salt', res.data.salt);
                   }
                });
            }

            $('a[href=#login], a[href=#signup]').click(function(e) {
                $('#dwLoginForm').modal();
                $('#dwLoginForm .alert').remove();
                var a = $(e.target);
                var clickedLogin = a.attr('href') == '#login';
                if (clickedLogin) {
                    $('#dwLoginForm .login-email').focus();
                } else {
                    $('#register-email').focus();
                    $('.row-login').css('opacity', 0.5);
                    $('.row-login *').click(function() {
                        $('.row-login').css('opacity', 1);
                    });
                }
                if (a.data('target')) $('#dwLoginForm .login-form').data('target', a.data('target'));

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
                   pwd2 = $.trim($('#register-pwd-2').val()),
                   auth_salt = $('#btn-register').data('salt');

               if (pwd == pwd2) {
                  if (true) {
                     var payload = {
                        email: $('#register-email').val(),
                        pwd: CryptoJS.HmacSHA256(pwd, auth_salt).toString(),
                        pwd2: CryptoJS.HmacSHA256(pwd2, auth_salt).toString()
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
                    pwd = $('.login-pwd', loginForm).val(),
                    auth_salt = lgBtn.data('salt'),
                    payload = {
                        email: $('.login-email', loginForm).val(),
                        pwhash: CryptoJS.HmacSHA256(pwd, auth_salt).toString(),
                        keeplogin: $('.keep-login', loginForm).attr('checked') == 'checked'
                    };
                if (pwd === '') {
                    $('.login-pwd', loginForm).parent().addClass('error');
                    return false;
                }

                $('.control-group', loginForm).removeClass('error');

                $.ajax({
                    url: '/api/auth/login',
                    type: 'POST',
                    dataType: 'json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        if (data.status == "ok") {
                            $('#dwLoginForm').modal('hide');
                            $('input', loginForm).val('');
                            if (loginForm.data('target')) location.href = loginForm.data('target');
                            else {
                                if (location.pathname == "/login") location.pathname = "/";
                                else location.reload();
                            }
                        } else {
                            if (data.code == 'login-invalid') {
                                $('.login-pwd', loginForm).parent().addClass('error');
                            } else if (data.code == 'login-email-unknown') {
                                $('.login-email', loginForm).parent().addClass('error');
                            }
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
            if (!_.isFunction(parent.prepend)) parent = $(parent);
            $('.alert', parent).remove();
            if (type === undefined) type = 'success';
            var alert = $('<div class="alert alert-'+type+'" />');
            alert.append('<a class="close" data-dismiss="alert" href="#">&times;</a>');
            alert.append('<div>'+msg+'</div>');
            parent.prepend(alert);
            $(".alert").alert();
        },

        logError: function(msg, parent) {
            this.logMessage(msg, parent, 'error');
        },

        resendActivationMail: function(msgElement) {
            var req = $.ajax({
                url: '/api/account/resend-activation',
                type: 'POST',
                dataType: 'json'
            });
            if (msgElement) {
                req.done(function(res) {
                    if (res.status == 'ok') {
                        DW.logMessage(res.data, msgElement);
                    } else {
                        DW.logError(res.message, msgElement);
                    }
                });
            }
            return req;
        },

        popupChart: function (id, preview) {
            $.getJSON('/api/charts/'+id, function(res) {
                if (res.status == "ok") {
                    var chart = res.data,
                        chartUrl = preview ? 'http://' + DW.__domain + '/chart/' + chart.id + '/preview' :
                            'http://' + DW.__chartCacheDomain + '/' + chart.id + '/index.html';
                        chartIframe = $('<iframe src="'+chartUrl+'" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>'),
                        wrapper = $('<div></div>'),
                        overlay = wrapper.overlay({
                            onClose: function() {
                                location.hash = '';
                            }
                        });
                    wrapper.append('<a class="close close-button">&#9747;</a>');
                    wrapper.append(chartIframe);

                    chartIframe.css({
                        width: chart.metadata.publish['embed-width'],
                        height: chart.metadata.publish['embed-height'],
                        background: (chart.metadata.publish['background'] || '#fff'),
                        border: '10px solid '+(chart.metadata.publish['background'] || '#fff'),
                        'border-radius': 10
                    });
                    overlay.open();
                    if (location.hash != '#/' + chart.id) {
                        location.hash = '#/' + chart.id;
                    }
                }
            });
        },

        /*
         * creates a PNG snapshot of a chart in a given iframe
         */
        snapshot: function (iframe, chart_id, thumb_id, width, height, callback) {

            function px(s) {
                return Math.floor(Number(s.substr(0, s.length-2)));
            }

            var body = iframe.get(0).contentDocument,
                win = iframe.get(0).contentWindow;

            if ($('svg', body).get(0) === undefined) return false;

            var svg = $('svg', body),
                c = win.vis.__canvas,
                x = c.lpad + (c.lpad2 || 0),
                y = 0,
                w = c.w - x - c.rpad,
                h = c.h - y - c.bpad,
                scale = Math.max(width / c.w, height / c.h);

            var canvas = document.createElement("canvas"),
                ctx = canvas.getContext("2d");

            canvas.width = c.w * scale;
            canvas.height = c.h * scale;

            ctx.fillStyle = win.vis.theme.colors.background;
            ctx.fillRect(0, 0, c.w * scale, c.h * scale);
            ctx.drawSvg(svg.get(0).innerSVG, 0, 0, c.w * scale, c.h * scale);

            var tempCanvas = document.createElement("canvas"),
                tCtx = tempCanvas.getContext("2d");

            tempCanvas.width = width;
            tempCanvas.height = height;

            //console.log( * scale);
            tCtx.drawImage(canvas, -x + (width - c.w * scale) * 0.5, -y);

            var imgData = tempCanvas.toDataURL("image/png");
            $.ajax({
                url: '/api/charts/' + chart_id + '/thumbnail/' + thumb_id,
                type: 'PUT',
                data: imgData,
                processData: false,
                dataType: 'json',
                success: function(res) {
                    if (res.status == "ok") (callback || function() {})();
                    else console.error(res);
                }
            });
        }
    });


    // -- now run datawrapper user interface
    $(function() {
        window.DW = new Datawrapper.Utils();
    });


}).call(this);