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
            msg = dw.backend.messages.provideCurPwd;
        }
        else if (pwd.length < 4) {
            errFields = '#pwd';
            msg = dw.backend.messages.pwdTooShort;
        }
        else if (pwd != pwd2) {
            errFields = '#pwd,#pwd2';
            msg = dw.backend.messages.pwdMismatch;
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
            c = win.__dw.vis.__canvas,
            x = c.lpad + (c.lpad2 || 0),
            y = 0,
            w = c.w - x - c.rpad,
            h = c.h - y - c.bpad,
            scale = Math.max(width / c.w, height / c.h);

        var canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d");

        canvas.width = c.w * scale;
        canvas.height = c.h * scale;

        ctx.fillStyle = win.vis.theme().colors.background;
        ctx.fillRect(0, 0, c.w * scale, c.h * scale);
        ctx.drawSvg(svg.get(0).innerSVG, 0, 0, c.w * scale, c.h * scale);

        var tempCanvas = document.createElement("canvas"),
            tCtx = tempCanvas.getContext("2d");

        tempCanvas.width = width;
        tempCanvas.height = height;

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

    function initLiveUpdates(iframe) {
        var chart_window = iframe.get(0).contentWindow,
            chart_body = iframe.get(0).contentDocument,
            __dw = chart_window.__dw,
            needReload = false;

        function $$(sel) {
            return $(sel, chart_body);
        }

        _.extend(__dw, {
            attributes: function(attrs) {
                if (changed('type') || changed('theme') || changed('metadata.data.transpose') || changed('metadata.axes')) {
                    needReload = true;
                    return;
                }
                // check if we need to update chart
                if (changed('metadata.visualize') && __dw.vis) {
                    __dw.vis.chart().attributes(attrs);
                    __dw.render();
                }
                if (changed('title')) {
                    if (heightChanged($$('.chart-title'), attrs.title)) __dw.render();
                }
                if (changed('metadata.describe.intro')) {
                    if (attrs.metadata.describe.intro && !$$('.chart-intro').length) needReload = true;
                    if (!attrs.metadata.describe.intro && $$('.chart-intro').length) needReload = true;
                    if (!needReload) {
                        if (heightChanged($$('.chart-intro'), attrs.metadata.describe.intro)) __dw.render();
                    }
                }
                __dw.old_attrs = $.extend(true, {}, attrs);

                function changed(key) {
                    var p0 = __dw.old_attrs,
                        p1 = attrs;
                    key = key.split('.');
                    _.each(key, function(k) {
                        p0 = p0[k];
                        p1 = p1[k];
                    });
                    return JSON.stringify(p0) != JSON.stringify(p1);
                }
                function heightChanged(el, html) {
                    var old_h = el.height();
                    el.html(html);
                    return el.height() != old_h;
                }
            },
            saved: function() {
                if (needReload) iframe.attr('src', iframe.attr('src'));
            }
        });
    }

    /*
     * updates the chart attributes of a rendered visualization
     * so that is doesn't have to be reloaded.
     */
    function updateChartInIframe(iframe, attributes) {
        var win = iframe.get(0).contentWindow;
        if (win.__dw && win.__dw.attributes) {
            win.__dw.attributes(attributes);
        } else {
            setTimeout(function() {
                updateChartInIframe(iframe, attributes);
            }, 100);
        }
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
                    chartUrl = preview ? location.protocol + '//' + dw.backend.__domain + '/chart/' + chart.id + '/preview' :
                        location.protocol + '//' + dw.backend.__chartCacheDomain + '/' + chart.id + '/index.html';
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
            nextSaveDeferred = $.Deferred(),
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
                        nextSaveDeferred.resolve(data);
                        // create new deferred
                        nextSaveDeferred = $.Deferred();
                    } else {
                        console.warn('could not save the chart', data);
                    }
                }
            });
        }

        chart.save = save;

        chart.onSave = function(callback) {
            saveCallbacks.push(callback);
        };

        chart.hasUnsavedChanges = function() {
            return unsavedChanges;
        };

        chart.nextSavePromise = function() {
            return nextSaveDeferred.promise();
        };

        chart.sync = function(el, attribute, _default) {
          if (_.isString(el)) el = $(el);
            el.data('sync-attribute', attribute);

            // initialize current state in UI
            var curVal = chart.get(attribute, _default);
            if (el.is('input[type=checkbox]'))  {
                el.prop('checked', curVal);
            } else if (el.is('input[type=text]') || el.is('textarea') || el.is('select')) {
                el.val(curVal);
            } else if (el.is('input[type=radio]')) {
                if (_.isBoolean(curVal)) {
                    curVal = curVal ? 'yes' : 'no';
                }
                $('input:radio[name='+el.attr('name')+'][value='+curVal+']').prop('checked', 'checked');
            }

            function storeElementValue(el) {
                var attr, val;
                // Resolve attribute string to a pointer to the attribute
                attr = el.data('sync-attribute');

                if (el.is('input[type=checkbox]')) {
                    val = el.prop('checked');
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

    var alertOpen = false,
        messageQueue = [],
        lastMessage = false;

    function customAlert(msg) {
        if (msg == lastMessage) return;
        if (!alertOpen) {
            $('#alertModal .message').html(msg);
            $('#alertModal').modal();
            alertOpen = true;
            lastMessage = msg;
        } else {
            messageQueue.push(msg);
        }
        $('#alertModal').off('hidden').on('hidden', function() {
            alertOpen = false;
            if (messageQueue.length) {
                setTimeout(function() {
                    customAlert(messageQueue.pop());
                }, 500);
            }
        });
    }

    function initColorSelector() {
        /*
         * API-draft:
         *
         * $('button').colorselector({
              color: '#ff0000'  // current selection
         *    palette: ['#fe8843', '#48cd45', ...],  // theme palette
         *    change: function(new_color) { }  // called after user closed popup
         * });
         */
        $.fn.colorselector = function(opts) {
            $('.color-selector').remove();
            var btn = $(this),
                popup = $('<div />')
                    .addClass('color-selector')
                    .css({
                        left: btn.offset().left,
                        top: btn.offset().top - 60 // 30px = body.padding-top
                    })
                    .appendTo('body'),
                palette = $('<div />').addClass('palette').appendTo(popup),
                lightness = $('<div />').addClass('color-axis lightness').appendTo(popup),
                saturation = $('<div />').addClass('color-axis saturation').appendTo(popup),
                hue = $('<div />').addClass('color-axis hue').appendTo(popup),
                bottom = $('<div />').addClass('footer').appendTo(popup),
                hexTf = $('<input type="text" />').addClass('hex').appendTo(bottom),
                okBtn = $('<button />').html('<i class="icon-ok"></i>').addClass('btn btn-small ok').appendTo(bottom);

            addcol(opts.color, bottom);

            // initialize palette colors
            $.each(opts.palette, function(i, color) {
                addcol(color, palette);
            });

            setColor(opts.color);

            function closePopup() {
                popup.remove();
                if (_.isFunction(opts.change)) opts.change(opts.color);
            }

            hexTf.change(function() { setColor(hexTf.val()); });
            okBtn.click(closePopup);

            setTimeout(function() {
                $('body').one('click', body_click);
            }, 300);

            function setColor(hex, cont) {
                var lch = chroma.color(hex).lch(),
                    center = [50, 50, lch[2]],
                    spread_ = [50, 50, 60],
                    steps = [3, 3, 7],
                    steps2 = [undefined, undefined, 6];

                opts.color = hex;
                _.each([lightness, saturation, hue], function(cnt, i) {
                    if (cont != cnt || cont == hue) {
                        cnt.html('');
                        _.each(spread(center[i], spread_[i], steps[i], steps2[i]), function(x) {
                            var lch_ = lch.slice(0);
                            lch_[i] = x;
                            addcol(chroma.lch(lch_).hex(), cnt);
                        });
                    }
                });
                hexTf.val(hex).css({
                    background: hex,
                    'border-color': chroma.color(hex).darker().hex(),
                    color: chroma.luminance(hex) > 0.45 ? '#000' : '#fff'
                });
                $('.color', popup).removeClass('selected').removeClass('inverted');
                $('.color', popup)
                    .filter(function(i,e) { return $(e).data('color') == hex; })
                    .addClass('selected');
                if ($('.color.selected', hue).length > 2) {
                    $('.color.selected', hue).removeClass('selected');
                }
                $('.color.selected', popup)
                    .filter(function(i,e) {
                        return chroma.luminance($(e).data('color')) < 0.05;
                    }).addClass('inverted');
            }

            function spread(center, width, num, num2) {
                var r = [center], s = width / num, a = 0;
                num2 = _.isUndefined(num2) ? num : num2;
                while (num-- > 0) {
                    a += s;
                    r.unshift(center - a);
                    if (num2-- > 0) r.push(center + a);
                }
                return r;
            }

            function addcol(color, cont) {
                $('<div />')
                    .addClass('color')
                    .data('color', color)
                    .css('background', color)
                    .click(function(evt) {
                        var c = $(evt.target);
                        setColor(c.data('color'), cont);
                        // stop propagation so body.click won't fire
                        evt.stopPropagation();
                    })
                    .dblclick(function(evt) {
                        var c = $(evt.target);
                        opts.color = c.data('color');
                        closePopup();
                    })
                    .appendTo(cont);
            }

            function body_click(evt) {
                var el = $(evt.target);
                if (!el.is('.color-selector') && el.parents('.color-selector').length === 0) {
                    popup.remove();
                } else {
                    $('body').one('click', body_click);
                }
            }
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

            initColorSelector();
        },

        logMessage: logMessage,
        logError: logError,
        snapshot: snapshot,
        initLiveUpdates: initLiveUpdates,
        updateChartInIframe: updateChartInIframe,
        popupChart: popupChart,
        checkPassword: checkPassword,
        clearAlerts: clearAlerts,
        syncChart: syncChart,
        alert: customAlert
    }; // end dw.backend

    // initialize backend on page load
    $(dw.backend.init);

}).call(this);
