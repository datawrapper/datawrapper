
define(function() {

    return function() {

        $('.nav-tabs').each(function(i, el) {
            var navTabs = $(el);
            $('li a', navTabs).each(function(i, el) {
                $('.'+$(el).data('target')).css({ position: 'absolute', left: -10000 }); // hide
                $(el).click(function(e) {
                    e.preventDefault();
                    $('.' + navTabs.data('target')+' > div').css({ position: 'absolute', left: -10000 }); // hide
                    $('.' + $(e.target).data('target')).css({ position: 'static' });  // show
                    $('li', navTabs).removeClass('active');
                    $(e.target).parents('li').addClass('active');
                });
            });
            $('li.active a', navTabs).each(function(i, el) {
                $('.'+$(el).data('target')).show().css({ position: 'static' }); // show
            });
        });

        function show(a) {
            a.tab('show');
            $('.tab-container > *').css({ position: 'absolute', left: -10000 });
            $('.tab-container .'+a.data('target')).css({ position: 'static' });
            if (a.attr('href') == '#story') {
                $('.proceed-btn').hide();
                $('.publish-btn').show();
            } else {
                $('.proceed-btn').show();
                $('.publish-btn').hide();
            }
            if (a.attr('href') == '#vis') {
                $('.btn-stepback').show();
                $('.btn-tabback').hide();
            } else {
                $('.btn-stepback').hide();
                $('.btn-tabback').show();
            }
        }

        $('.publish-btn').hide();
        $('.btn-stepback').hide();
        $('.proceed-btn').click(function() {
            var li = $('.visualize-nav-tabs li.active');
            var a = $('a', li.next());
            location.hash = '#'+a.data('target');
            show(a);
        });
        $('.btn-tabback').click(function() {
            var li = $('.visualize-nav-tabs li.active');
            var a = $('a', li.prev());
            location.hash = '#'+a.data('target');
            show(a);
        });

        $('.visualize-nav-tabs a').on('click', function (e) {
            var a = $(e.target);
            location.hash = '#'+a.data('target');
            if (a.attr('href') == '#story') {
                $('.proceed-btn').hide();
                $('.publish-btn').show();
            } else {
                $('.proceed-btn').show();
                $('.publish-btn').hide();
            }
            if (a.attr('href') == '#vis') {
                $('.btn-stepback').show();
                $('.btn-tabback').hide();
            } else {
                $('.btn-stepback').hide();
                $('.btn-tabback').show();
            }
        });

        function loadTab(evt) {
            if (location.hash) {
                var a = location.hash.substr(1);
                if (a != 'select-visualization' && a != 'refine-the-chart' && a != 'tell-the-story') {
                    return;
                }
                show($('a[data-target='+a+']'));
                if (evt) evt.preventDefault();
            }
        }

        $(window).on('hashchange', loadTab);
        loadTab();
    };

});