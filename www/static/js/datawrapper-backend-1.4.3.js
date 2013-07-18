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



}).call(this);(function(){

    // Datawrapper.Dataset
    // -------------------
    // DEPRECATED!
    return;

    //
    var Dataset = Datawrapper.Dataset = function(options) {
        _.extend(options, {
            type: 'delimited'
        });
        this.__options = options;
    };

    _.extend(Dataset.prototype, {

        _initialize: function() {
            var me = this,
                opts = me.__options;
        },

        _fetchDelimited: function(callbacks) {
            var me = this,
                opts = me.__options;

            if (opts.url !== undefined) {
                if (me.__lastUrl == opts.url) {
                    // use cached data
                    loaded(me.__rawData);
                } else {
                    // load data from url
                    $.ajax({
                        url: opts.url,
                        method: 'GET',
                        dataType: "text", // NOTE (edouard): Without that jquery try to parse the content and return a Document
                        success: function(raw) {
                            me._delimtedLoaded(raw);
                            if (_.isFunction(callbacks.success)) {
                                callbacks.success();
                            }
                        }
                    });
                }
            }
        },

        _delimtedLoaded: function(raw, callbacks) {
            var me = this, opts = me.__options;
            me.__rawData = raw;
            // parse data
            var parser = new Datawrapper.Parsers.Delimited(opts),
                data = parser.parse(raw);
            me.__data = data;
            me.__loaded = true;
            me.__parser = parser;
            me._processData(data);
        },

        _processData: function(data) {
            var me = this,
                numParser = new NumberParser();
            me.__seriesByName = {};
            // at first we teach the parser all numbers we have
            _.each(data.series, function(s) {
                me.__seriesByName[s.name] = s;
                s._min = function() {
                    //console.warn('series._min() is deprecated, use series.min instead.');
                    return s.min;
                };
                s._max = function() {
                    //console.warn('series._max() is deprecated, use series.max instead.');
                    return s.max;
                };
                _.each(s.data, function(number) {
                    numParser.learn(number);
                });
            });
            // then we let parse the numbers
            _.each(data.series, function(s) {
                s.min = Number.MAX_VALUE;
                s.max = -Number.MAX_VALUE;
                s.total = 0;
                _.each(s.data, function(number, i) {
                    s.data[i] = numParser.parse(number);
                    if (!isNaN(s.data[i])) {
                        // this is buggy in IE7
                        s.min = Math.min(s.min, s.data[i]);
                        s.max = Math.max(s.max, s.data[i]);
                        s.total += s.data[i];
                    }
                });
                // store copy of original data in origdata
                s.origdata = s.data.slice();
            });
            // check if row names contain dates
            if (me.hasRowNames()) {
                var dateParser = new DateParser();
                me.eachRow(function(i) {
                    dateParser.learn(me.rowName(i));
                });
                if (dateParser.validFormat()) {
                    me.__dateFormat = dateParser.__format;
                    me.__rowDates = [];
                    me.eachRow(function(i) {
                        me.__rowDates.push(dateParser.parse(me.rowName(i)));
                    });
                }
            }
        },


        // PUBLIC API

        /*
         * loads a new dataset
         */
        fetch: function(callbacks) {
            var me = this, opts = me.__options;

            if (opts.type == "delimited") {
                me._fetchDelimited(callbacks);
            }
        },

        /*
         *
         */
        fetchRaw: function() {
            var me = this, opts = me.__options;
            if (opts.type == "delimited") {
                me._delimtedLoaded(opts.rawData);
            }
        },

        /*
         * returns either a single series by name or index, or a list of
         * all series, if no parameter x is given
         */
        series: function(x) {
            var me = this;
            if (_.isString(x)) {
                // single series by name
                if (me.__seriesByName[x] !== undefined) return me.__seriesByName[x];
                throw 'No series found with that name: "'+x+'"';
            }
            if (x !== undefined) {
                // single series by index
                if (me.__data.series[x] !== undefined) return me.__data.series[x];
                throw 'No series found with that index: '+x;
            }
            return this.__data.series;
        },

        hasRowNames: function() {
            return this.__data.rowNames !== undefined;
        },

        numRows: function() {
            return this.__data.series[0].data.length;
        },

        eachRow: function(func) {
            var i;
            for (i=0; i<this.numRows(); i++) {
                func(i);
            }
        },

        eachSeries: function(func) {
            _.each(this.series(), func);
        },

        rowNames: function() {
            return this.__data.rowNames;
        },

        rowName: function(i) {
            var me = this, k;
            if (!me.hasRowNames()) return '';
            k = me.__data.rowNames.length;
            return me.__data.rowNames[(i + k) % k];
        },

        rowNameLabel: function() {
            return this.__data.rowNameLabel !== undefined ? this.__data.rowNameLabel : '';
        },

        /*
         * removes every row except the one with index i
         * and updates min, max and total of each series
         */
        filterRows: function(rows) {
            this.eachSeries(function(s) {
                var d = [];
                s.total = 0;
                s.min = Number.MAX_VALUE;
                s.max = Number.MAX_VALUE*-1;
                _.each(rows, function(i) {
                    d.push(s.origdata[i]);
                    s.total += s.origdata[i];
                    s.min = Math.min(s.min, s.origdata[i]);
                    s.max = Math.max(s.max, s.origdata[i]);
                });
                s.data = d;
            });
        },

        /*
         * returns a tree data structure from this dataset
         */
        parseTree: function(row) {
            var tree = { children: [], depth: 0 };
            this.eachSeries(function(s) {
                var parts = s.name.split('>');
                var node = tree;
                _.each(parts, function(p, i) {
                    parts[i] = p = p.trim();
                    var found = false;
                    _.each(node.children, function(c) {
                        if (c.name.trim() == p) {
                            node = c;
                            found = true;
                            return false;
                        }
                    });
                    if (!found) { // child not found, create new one
                        var n = { name: p, children: [], _series: s, _row: 0, depth: i+1 };
                        if (i == parts.length-1) n.value = s.data[row];
                        node.children.push(n);
                        node = n;
                    }
                });
            });
            return tree;
        },

        serializeDelimited: function() {
            var me = this;
            var data = [[]];

            if (me.hasRowNames()) data[0].push('');

            function isNone(val) {
                return val === null || val === undefined || (_.isNumber(val) && isNaN(val));
            }

            _.each(me.series(), function(s) {
                data[0].push((!isNone(s.name) ? s.name : ''));
            });

            me.eachRow(function(row) {
                var tr = [];
                if (me.hasRowNames()) {
                    tr.push(!isNone(me.rowName(row)) ? me.rowName(row) : '');
                }
                me.eachSeries(function(s, i) {
                    var val = s.data[row];
                    tr.push((!isNone(s.data[row]) ? val : 'n/a'));
                });
                data.push(tr);
            });

            return data.map(function(row) { return row.join(me.__parser.delimiter); }).join('\n');
        },

        /*
         * removes ignored series from dataset
         */
        filterSeries: function(ignore) {
            var me = this;
            me.__data.series = me.__data.series.filter(function(s) {
                return !ignore[s.name];
            });
        },

        /**
         * Returns true if the datasets row labels could
         * correctly be parsed as date values.
         */
        isTimeSeries: function() {
            return this.__rowDates !== undefined;
        },

        /**
         * Returns a Date object for a given row.
         */
        rowDate: function(i) {
            if (i < 0) i += this.__rowDates.length;
            return this.__rowDates[i];
        },

        /**
         * Returns (a copy of) the list of all rows Date objects.
         */
        rowDates: function() {
            return this.__rowDates.slice(0);
        },

        /**
         * Returns array of min/max values
         */
        minMax: function() {
            var minmax = [Number.MAX_VALUE, -Number.MAX_VALUE];
            this.eachSeries(function(s) {
                minmax[0] = Math.min(minmax[0], s.min);
                minmax[1] = Math.max(minmax[1], s.max);
            });
            return minmax;
        }
    });

    var NumberParser = function() {
        this.__numbers = [];
        this.__knownFormats = {
            '-.': /^[\-\.]?[0-9]+(\.[0-9]+)?$/,
            '-,': /^[\-,]?[0-9]+(,[0-9]+)?$/,
            ',.': /^[0-9]{1,3}(,[0-9]{3})(\.[0-9]+)?$/,
            '.,': /^[0-9]{1,3}(\.[0-9]{3})(,[0-9]+)?$/,
            ' .': /^[0-9]{1,3}( [0-9]{3})(\.[0-9]+)?$/,
            ' ,': /^[0-9]{1,3}( [0-9]{3})(,[0-9]+)?$/
        };
    };

    _.extend(NumberParser.prototype, {

        // get some input numbers
        learn: function(number) {
            this.__numbers.push(number);
        },

        // test all numbers against certain
        _getFormat: function() {
            var me = this,
                matches = {},
                bestMatch = ['', 0];
            _.each(me.__numbers, function(n) {
                _.each(me.__knownFormats, function(regex, fmt) {
                    if (matches[fmt] === undefined) matches[fmt] = 0;
                    if (regex.test(n)) {
                        matches[fmt] += 1;
                        if (matches[fmt] > bestMatch[1]) {
                            bestMatch[0] = fmt;
                            bestMatch[1] = matches[fmt];
                        }
                    }
                });
            });
            return bestMatch[0];
        },

        parse: function(raw) {
            var me = this,
                number = raw,
                fmt = this.__format;
            if (raw === null || raw === undefined || raw === '') return 'n/a';
            if (fmt === undefined) {
                fmt = this.__format = this._getFormat();
            }
            // normalize number
            if (fmt[0] == ',' || fmt[0] == '.' || fmt[0] == ' ') {
                // remove kilo seperator
                number = number.replace(fmt[0], '');
            }
            if (fmt[1] != '.') {
                // replace decimal char w/ point
                number = number.replace(fmt[1], '.');
            }
            number = Number(number);
            return isNaN(number) ? raw : number;
        }

    });

    var DateParser = function() {
        var me = this;
        me.__dates = [];
        me.__knownFormats = {
            'year': /^([12][0-9]{3})$/,
            'quarter': /^([12][0-9]{3}) ?[\-\/Q|]([1234])$/,
            'month': /^([12][0-9]{3}) ?[-\/\.M](0[1-9]|1[0-2])$/,
            'date': /^([12][0-9]{3})[-\/](0[1-9]|1[0-2])[-\/]([0-2][0-9]|3[01])$/
        };
    };

    _.extend(DateParser.prototype, {
        // get some input numbers
        learn: function(date_str) {
            this.__dates.push(date_str);
        },

        // test all strings against the known formats
        _getFormat: function() {
            var me = this, format = false;
            _.each(me.__knownFormats, function(regex, fmt) {
                var valid = true;
                _.each(me.__dates, function(n) {
                    if (!regex.test(n)) {
                        valid = false;
                        return false;
                    }
                });
                if (valid) {
                    format = fmt;
                    return false;
                }
            });
            return format;
        },

        validFormat: function() {
            var me = this;
            me.__format = me._getFormat();
            return me.__format !== false;
        },

        parse: function(raw) {
            var me = this,
                date = raw,
                fmt = me.__format = me.__format === undefined ? me._getFormat() : me.__format;

            if (fmt === false) return raw;
            var regex = me.__knownFormats[fmt],
                m = raw.match(regex);

            if (!m) return raw;
            switch (fmt) {
                case 'year': return new Date(m[1], 0, 1);
                case 'quarter': return new Date(m[1], (m[2]-1) * 3, 1);
                case 'month': return new Date(m[1], (m[2]-1), 1);
                case 'date': return new Date(m[1], (m[2]-1), m[3]);
            }
            return raw;
        }
    });

}).call(this);// Datawrapper
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
        //window.DW = new Datawrapper.Utils();
        window.DW = {};
    });


}).call(this);(function(){

    // Datawrapper.Theme
    // -----------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes = {};

    Datawrapper.Themes.Base = {

        /*
         * colors used in the theme
         */
        colors: {
            palette: ['#6E7DA1', '#64A4C4', '#53CCDD',  '#4EF4E8'],
            secondary: ["#000000", '#777777', '#cccccc', '#ffd500', '#6FAA12'],

            positive: '#85B4D4',
            negative: '#E31A1C',
            // colors background and text needs to be set in CSS as well!
            background: '#ffffff',
            text: '#000000'
        },

        /*
         * padding around the chart area
         */
        padding: {
            left: 0,
            right: 20,
            bottom: 30,
            top: 10
        },

        /*
         * custom properties for line charts
         */
        lineChart: {
            // stroke width used for lines, in px
            strokeWidth: 3,
            // the maximum width of direct labels, in px
            maxLabelWidth: 80,
            // the opacity used for fills between two lines
            fillOpacity: 0.2,
            // distance between labels and x-axis
            xLabelOffset: 20
        },

        /*
         * custom properties for column charts
         */
        columnChart: {
            // if set to true, the horizontal grid lines are cut
            // so that they don't overlap with the grid label.
            cutGridLines: false,
            // you can customize bar attributes
            barAttrs: {
                'stroke-width': 1
            }
        },

        /*
         * custom properties for bar charts
         */
        barChart: {
            // you can customize bar attributes
            barAttrs: {
                'stroke-width': 1
            }
        },

        /*
         * attributes of x axis, if there is any
         */
        xAxis: {
            stroke: '#333'
        },

        /*
         * attributes of y-axis if there is any shown
         */
        yAxis: {
            strokeWidth: 1
        },


        /*
         * attributes applied to horizontal grids if displayed
         * e.g. in line charts, column charts, ...
         *
         * you can use any property that makes sense on lines
         * such as stroke, strokeWidth, strokeDasharray,
         * strokeOpacity, etc.
         */
        horizontalGrid: {
            stroke: '#d9d9d9'
        },

        /*
         * just like horizontalGrid. used in line charts only so far
         *
         * you can define the grid line attributes here, e.g.
         * verticalGrid: { stroke: 'black', strokeOpacity: 0.4 }
         */
        verticalGrid: false,

        /*
         * draw a frame around the chart area (only in line chart)
         *
         * you can define the frame attributes here, e.g.
         * frame: { fill: 'white', stroke: 'black' }
         */
        frame: false,

        /*
         * if set to true, the frame border is drawn separately above
         * the other chart elements
         */
        frameStrokeOnTop: false,

        /*
         * probably deprecated
         */
        yTicks: false,


        hover: true,
        tooltip: true,

        hpadding: 0,
        vpadding: 10,

        /*
         * some chart types (line chart) go into a 'compact'
         * mode if the chart width is below this value
         */
        minWidth: 400,

        /*
         * theme locale, probably unused
         */
        locale: 'de_DE',

        /*
         * duration for animated transitions (ms)
         */
        duration: 1000,

        /*
         * easing for animated transitions
         */
         easing: 'expoInOut'

    };

}).call(this);(function(){

      // Datawrapper.Parsers.Delimited
      // -----------------------------

   /**
    * Smart delimited data parser.
    * - Handles CSV and other delimited data.
    * Includes auto-guessing of delimiter character
    * Parameters:
    *   options
    *     delimiter : ","
    */
   Datawrapper.Parsers.Delimited = function(options) {
      options = options || {};

      this.delimiter = options.delimiter || ",";

      this.quoteChar = options.quoteChar || "\"";

      this.skipRows = options.skipRows || 0;

      this.emptyValue = options.emptyValue || null;

      this.transpose = options.transpose || false;

      this.firstRowIsHeader = options.firstRowIsHeader !== undefined ? options.firstRowIsHeader : true;

      this.firstColumnIsHeader = options.firstRowIsHeader !== undefined ? options.firstColumnIsHeader : true;

      this.getDelimiterPatterns = function(delimiter, quoteChar) {
         return new RegExp(
            (
            // Delimiters.
            "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
            // Quoted fields.
            "(?:" + quoteChar + "([^" + quoteChar + "]*(?:" + quoteChar + "\"[^" + quoteChar + "]*)*)" + quoteChar + "|" +
            // Standard fields.
            "([^" + quoteChar + "\\" + delimiter + "\\r\\n]*))"), "gi");
      };

      this.__delimiterPatterns = this.getDelimiterPatterns(this.delimiter, this.quoteChar);
   };


   _.extend(Datawrapper.Parsers.Delimited.prototype, Datawrapper.Parsers.prototype, {

      parse: function(data) {

         this.__rawData = data;

         if (this.delimiter == 'auto') {
            this.delimiter = this.guessDelimiter(data, this.skipRows);
            this.__delimiterPatterns = this.getDelimiterPatterns(this.delimiter, this.quoteChar);

         }
         var columns = [],
            closure = this.delimiter != '|' ? '|' : '#',
            arrData;

         data = closure + data.replace(/\s+$/g, '') + closure;

         var parseCSV = function(delimiterPattern, strData, strDelimiter) {
            // implementation and regex borrowed from:
            // http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm

            // Check to see if the delimiter is defined. If not,
            // then default to comma.
            strDelimiter = (strDelimiter || ",");

            // Create an array to hold our data. Give the array
            // a default empty first row.
            var arrData = [
               []
            ];

            // Create an array to hold our individual pattern
            // matching groups.
            var arrMatches = null,
               strMatchedValue;

            // Keep looping over the regular expression matches
            // until we can no longer find a match.
            while (arrMatches = delimiterPattern.exec(strData)) {
               // Get the delimiter that was found.
               var strMatchedDelimiter = arrMatches[1];

               // Check to see if the given delimiter has a length
               // (is not the start of string) and if it matches
               // field delimiter. If id does not, then we know
               // that this delimiter is a row delimiter.
               if (
               strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {

                  // Since we have reached a new row of data,
                  // add an empty row to our data array.
                  arrData.push([]);

               }


               // Now that we have our delimiter out of the way,
               // let's check to see which kind of value we
               // captured (quoted or unquoted).
               if (arrMatches[2]) {

                  // We found a quoted value. When we capture
                  // this value, unescape any double quotes.
                  strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");

               } else {

                  // We found a non-quoted value.
                  strMatchedValue = arrMatches[3];

               }


               // Now that we have our value string, let's add
               // it to the data array.
               arrData[arrData.length - 1].push(strMatchedValue);
            }

            // remove closure
            if (arrData[0][0].substr(0,1) == closure) {
               arrData[0][0] = arrData[0][0].substr(1);
            }
            var p = arrData.length-1,
               q = arrData[p].length-1,
               r = arrData[p][q].length-1;
            if (arrData[p][q].substr(r) == closure) {
               arrData[p][q] = arrData[p][q].substr(0, r);
            }

            // Return the parsed data.
            return (arrData);
         },

         transpose = function(arrMatrix) {
            // borrowed from:
            // http://www.shamasis.net/2010/02/transpose-an-array-in-javascript-and-jquery/
            var a = arrMatrix,
               w = a.length ? a.length : 0,
               h = a[0] instanceof Array ? a[0].length : 0;
            if (h === 0 || w === 0) {
               return [];
            }
            var i, j, t = [];
            for (i = 0; i < h; i++) {
               t[i] = [];
               for (j = 0; j < w; j++) {
                  t[i][j] = a[j][i];
               }
            }
            return t;
         };

         parseDataArray = function(arrData, skipRows, emptyValue, firstRowIsHeader, firstColIsHeader) {
            var series = [],
               seriesNames = {},
               rowCount = arrData.length,
               columnCount = arrData[0].length,
               rowIndex = skipRows;

            // compute series
            var srcColumns = [];
            if (firstRowIsHeader) {
               srcColumns = arrData[rowIndex];
               rowIndex++;
            }

            // check that columns names are unique and not empty

            for (var c=0; c<columnCount; c++) {
               var col = _.isString(srcColumns[c]) ? srcColumns[c].replace(/^\s+|\s+$/g, '') : '',
                  suffix = col !== '' ? '' : 1;
               col = col !== '' ? col : 'X.';
               while (seriesNames[col+suffix] !== undefined) {
                  suffix = suffix === '' ? 1 : suffix + 1;
               }
               series.push({ name: col+suffix, data: [] });
               seriesNames[col+suffix] = true;
            }

            for (; rowIndex < rowCount; rowIndex++) {
               _.each(series, function(s, i) {
                  s.data.push(arrData[rowIndex][i] !== '' ? arrData[rowIndex][i] : emptyValue);
               });
            }

            var header;
            if (firstColIsHeader) {
               header = series[0];
               series = series.slice(1);
            }

            return {
               series: series,
               rowNames: header ? header.data : undefined,
               rowNameLabels: header ? header.name : undefined
            };
         }, // end parseDataArray

         arrData = parseCSV(this.__delimiterPatterns, data, this.delimiter);
         if (this.transpose) {
            arrData = transpose(arrData);
            // swap row/column header setting
            var t = this.firstRowIsHeader;
            this.firstRowIsHeader = this.firstColumnIsHeader;
            this.firstColumnIsHeader = t;
         }
         return parseDataArray(arrData, this.skipRows, this.emptyValue, this.firstRowIsHeader, this.firstColumnIsHeader);
      },

      guessDelimiter: function(strData) {
         // find delimiter which occurs most often
         var maxMatchCount = 0,
            k = -1,
            me = this,
            delimiters = ['\t',';','|',','];
         _.each(delimiters, function(delimiter, i) {
            var regex = me.getDelimiterPatterns(delimiter, me.quoteChar),
               c = strData.match(regex).length;
            if (c > maxMatchCount) {
               maxMatchCount = c;
               k = i;
            }
         });
         return delimiters[k];
      }

   });


}(this, _));(function(){

    // Datawrapper.Visualization.Base
    // ------------------------------

    // Every visualization should extend this class.
    // It provides the basic API between the chart template
    // page and the visualization class.

    Datawrapper.Visualizations = {
        Base: (function() {}).prototype
    };

    _.extend(Datawrapper.Visualizations.Base, {

        render: function(el) {
            $(el).html('implement me!');
        },

        setTheme: function(theme) {
            this.theme = theme;
            var attr_properties = ['horizontalGrid', 'verticalGrid', 'yAxis', 'xAxis'];
            _.each(attr_properties, function(prop) {
                // convert camel-case to dashes
                if (theme.hasOwnProperty(prop)) {
                    for (var key in theme[prop]) {
                        // dasherize
                        var lkey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
                        if (!theme[prop].hasOwnProperty(lkey)) {
                            theme[prop][lkey] = theme[prop][key];
                        }
                    }
                }
            });
            return this;
        },

        setSize: function(width, height) {
            var me = this;
            me.__w = width;
            me.__h = height;
            return me;
        },

        /**
         * short-cut for this.chart.get('metadata.visualize.*')
         */
        get: function(str, _default) {
            return this.chart.get('metadata.visualize.'+str, _default);
        },

        warn: function(str) {
            var warning = $('<div>' + str + '</div>');
            warning.css({
                'background-color': '#FCF8E3',
                'border': '1px solid #FBEED5',
                'border-radius': '4px 4px 4px 4px',
                'color': '#a07833',
                'margin-bottom': '18px',
                'padding': '8px 35px 8px 14px',
                'text-shadow': '0 1px 0 rgba(255, 255, 255, 0.5)',
                'left': '10%',
                'right': '10%',
                'z-index': 1000,
                'text-align': 'center',
                position: 'absolute'
            });
            $('body').prepend(warning);
            warning.hide();
            warning.fadeIn();
        },

        /**
         * returns a signature for this visualization which will be used
         * to test correct rendering of the chart in different browsers.
         * See raphael-chart.js for example implementation.
         */
        signature: function() {
            // nothing here, please overload
        },

        translate: function(str) {
            var locale = this.meta.locale, lang = this.lang;
            return locale[str] ? locale[str][lang] || locale[str] : str;
        },

        checkBrowserCompatibility: function(){
            return true;
        },

        setChart: function(chart) {
            console.log('vis::init', chart, chart.dataset());
            var me = this;
            me.dataset = chart.dataset();
            me.theme = chart.theme();
            me.chart = chart;
            me.dataset.filterSeries(chart.get('metadata.data.ignore-series', {}));
        },

        axes: function() {
            var me = this,
                dataset = me.dataset,
                usedColumns = {},
                defAxes = {},
                errors = [];
            _.each(me.meta.axes, function(axisDef, key) {
                function checkColumn(col) {
                    return !usedColumns[col.name()] &&
                        _.indexOf(axisDef.accepts, col.type()) >= 0;
                }
                if (!axisDef.optional) {
                    if (!axisDef.multiple) {
                        // find first colulmn accepted by axis
                        var c = _.find(dataset.columns(), checkColumn);
                        if (c) {
                            usedColumns[c.name()] = true; // mark column as used
                            defAxes[key] = c.name();
                        } else {
                            errors.push('Error: Could not populate axis <b>'+key+'</b> a data column of the type '+axisDef.accepts);
                            return;
                        }
                    } else {
                        defAxes[key] = [];
                        dataset.eachColumn(function(c) {
                            if (checkColumn(c)) {
                                usedColumns[c.name()] = true;
                                defAxes[key].push(c.name());
                            }
                        });
                        if (!defAxes[key].length) {
                            errors.push('Error: Could not populate axis <b>'+key+'</b> with a column of the type '+axisDef.accepts);
                        }
                    }
                }
            });
            if (errors.length) {
                me.warn(errors.join('<br/>'));
                return false;
            }
            return me.chart.get('metadata.axes', defAxes);
        },

        keys: function() {
            var me = this,
                axesDef = me.axes();
            if (axesDef.labels) {
                var lblCol = me.dataset.column(axesDef.labels),
                    fmt = dw.utils.longDateFormat(lblCol),
                    keys = [];
                lblCol.each(function(val) {
                    keys.push(fmt(val));
                });

                return keys;
            }
            return [];
        }

    });

}).call(this);