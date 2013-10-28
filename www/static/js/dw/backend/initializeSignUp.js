
define(function() {

    /*
     * initialize sign up form
     */
    return function() {

        function refreshSalt() {
            $.getJSON('/api/auth/salt', function(res) {
               if (res.status == 'ok') {
                  $('.btn-register, .btn-login').data('salt', res.data.salt);
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

        $('.btn-register').click(function(evt) {
            var form = $(evt.target).parents('.signup-form'),
                pwd = $.trim($('.register-pwd', form).val()),
                pwd2 = $.trim($('.register-pwd-2', form).val()),
                auth_salt = $('.btn-register', form).data('salt');

           if (pwd == pwd2) {
              if (true) {
                 var payload = {
                    email: $('.register-email', form).val(),
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
                            $('.signup-form input', form).val('');
                            // and close popup. User should be logged in now.
                            dw.backend.logMessage('Yeah, sign up went well! You are logged in now...', '.signup-form');
                            setTimeout(function() {
                                $('#dwLoginForm').modal('hide');
                                reload();
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
    }; // end initialize signup

});