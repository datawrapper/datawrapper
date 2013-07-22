/*
 * new version of most of the stuff used in dw.utils.js
 * core will be refactored to use this later...
 */

var dw = dw || {};

(function() {

    /*
     * activate the language links in main navbar
     */
    function initLanguageLinks() {
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

    /*
     * initialize sign up form
     */
    function initializeSignUp() {

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
                            dw.backend.logMessage('Yeah, sign up went well! You are logged in now...', '.signup-form');
                            setTimeout(function() {
                                $('#dwLoginForm').modal('hide');
                                dw.backend.refreshHeader();
                            }, 1000);
                        } else {
                            dw.backend.logError(data.code, '.signup-form');
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
                        dw.backend.logError(data.message, loginForm);
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
    } // end initialize signup

    /*
     * initialize logout links
     */
    function initializeLogout() {
        $('a[href=#logout]').click(function() {
            $.ajax({
                url: '/api/auth/logout',
                type: 'POST',
                success: function(data) {
                    // sometimes it's a good idea to redirect
                    location.href = '/';
                }
            });
            return false;
        });
    }

    function checkPassword(curPwd, pwd, pwd2) {
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
            dw.backend.logError(
                msg, $(errFields.split(',')[0]).parents('.control-group')
            );
            $(errFields).parents('.control-group').addClass('error');
            return false;
        }
        return true;
    }

    /*
     * display an alert block
     */
    function logMessage(msg, parent, type) {
        if (!_.isFunction(parent.prepend)) parent = $(parent);
        $('.alert', parent).remove();
        if (type === undefined) type = 'success';
        var alert = $('<div class="alert alert-'+type+'" />');
        alert.append('<a class="close" data-dismiss="alert" href="#">&times;</a>');
        alert.append('<div>'+msg+'</div>');
        parent.prepend(alert);
        $(".alert").alert();
    }

    function logError(msg, parent) {
        logMessage(msg, parent, 'error');
    }

    function clearAlerts() {
        $('.alert').remove();
        $('.error').removeClass('error');
    }

    /*
     * creates a client-side PNG snapshop of a chart in a given iframe
     */
    function snapshot(iframe, chart_id, thumb_id, width, height, callback) {

        function px(s) { return Math.floor(Number(s.substr(0, s.length-2))); }

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

    /*
     *
     */
    function resendActivationMail(msgElement) {
        var req = $.ajax({
            url: '/api/account/resend-activation',
            type: 'POST',
            dataType: 'json'
        });
        if (msgElement) {
            req.done(function(res) {
                if (res.status == 'ok') {
                    logMessage(res.data, msgElement);
                } else {
                    logError(res.message, msgElement);
                }
            });
        }
        return req;
    }

    function popupChart(id, preview) {
        $.getJSON('/api/charts/'+id, function(res) {
            if (res.status == "ok") {
                var chart = res.data,
                    chartUrl = preview ? 'http://' + dw.backend.__domain + '/chart/' + chart.id + '/preview' :
                        'http://' + dw.backend.__chartCacheDomain + '/' + chart.id + '/index.html';
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
    }

    function syncChart(chart) {
        var saveTimeout,
            unsavedChanges = false,
            saveCallbacks = [];
        function save() {
            $.ajax({
                url: '/api/charts/'+chart.get('id'),
                type: 'PUT',
                dataType: 'json',
                data: JSON.stringify(chart.attributes()),
                processData: false,
                success: function(data) {
                    //console.debug('save completed');
                    if (data.status == "ok") {
                        // run callbacks
                        unsavedChanges = false;
                        _.each(saveCallbacks, function(cb) {
                            cb(chart);
                        });
                    } else {
                        console.warn('could not save the chart', data);
                    }
                }
            });
        }

        chart.onSave = function(callback) {
            saveCallbacks.push(callback);
        };

        chart.hasUnsavedChanges = function() {
            return unsavedChanges;
        };

        chart.sync = function(el, attribute, _default) {
          if (_.isString(el)) el = $(el);
            el.data('sync-attribute', attribute);

            // initialize current state in UI
            var curVal = chart.get(attribute, _default);
            if (el.is('input[type=checkbox]')) {
                if (curVal) el.attr('checked', 'checked');
                else el.removeAttr('checked');
            } else if (el.is('input[type=text]') || el.is('textarea') || el.is('select')) {
                el.val(curVal);
            } else if (el.is('input[type=radio]')) {
                if (_.isBoolean(curVal)) {
                    curVal = curVal ? 'yes' : 'no';
                }
                $('input:radio[name='+el.attr('name')+'][value='+curVal+']').attr('checked', 'checked');
            }

            function storeElementValue(el) {
                var attr, val;
                // Resolve attribute string to a pointer to the attribute
                attr = el.data('sync-attribute');

                if (el.is('input[type=checkbox]')) {
                    val = el.attr('checked') == 'checked';
                } else if (el.is('input[type=text]') || el.is('textarea') || el.is('select')) {
                    val = el.val();
                } else if (el.is('input[type=radio]')) {
                    val = $('input:radio[name='+el.attr('name')+']:checked').val();
                    if (val === 'yes') val = true;
                    else if (val === 'no') val = false;
                }
                if (val !== undefined) {
                    chart.set(attr, val);
                }
            }

            el.change(function(evt) {
                storeElementValue($(evt.target));
            });

            if (el.is('input[type=text]') || el.is('textarea')) {
                el.keyup(function(evt) {
                    storeElementValue($(evt.target));
                });
            }
        };

        chart.onChange(function() {
            unsavedChanges = true;
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(save, 800);
        });

        window.onbeforeunload = function(e) {
            if (unsavedChanges) return 'Caution: unsaved changes';
        };
    }

    dw.backend = {
        init: function() {
            initLanguageLinks();
            initializeSignUp();
            initializeLogout();

            $('a[data-toggle=modal]').click(function(e) {
                var a = $(e.target),
                    tgt = $(a.data('target'));
                tgt.modal();
            });
        },

        logMessage: logMessage,
        logError: logError,
        snapshot: snapshot,
        popupChart: popupChart,
        checkPassword: checkPassword,
        clearAlerts: clearAlerts,
        syncChart: syncChart
    }; // end dw.backend

    // initialize backend on page load
    $(dw.backend.init);

}).call(this);
