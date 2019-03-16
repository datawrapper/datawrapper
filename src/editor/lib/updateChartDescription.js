/* globals dw, $, _ */

export default function({ iframe, attrs }) {
    const win = iframe.contentWindow;
    const doc = iframe.contentDocument;

    if (!win.__dw) return false;

    if (changed('title') || changed('metadata.describe.hide-title')) {
        const $title = $$('.chart-title');
        const $h1 = $title.parent();
        if (attrs.title && !attrs.metadata.describe['hide-title']) {
            if (!$title.length) return reload();
            // no title found, reload chart
            else if ($h1.hasClass('hidden')) {
                $h1.removeClass('hidden');
            }
        } else {
            if (!$h1.hasClass('hidden')) {
                $h1.addClass('hidden');
            }
        }
    }
    if (changed('metadata.describe.intro')) {
        var $desc = $$('.chart-intro');
        if (attrs.metadata.describe.intro) {
            if (!$desc.length) return reload();
            // no title found, reload chart
            else if ($desc.hasClass('hidden')) {
                $desc.removeClass('hidden');
            }
        } else {
            if (!$desc.hasClass('hidden')) {
                $desc.addClass('hidden');
            }
        }
    }
    if (changed('metadata.annotate.notes')) {
        var $notes = $$('.dw-chart-notes');
        if (attrs.metadata.annotate.notes) {
            if ($notes.hasClass('hidden')) {
                $notes.removeClass('hidden');
            }
        } else {
            if (!$notes.hasClass('hidden')) {
                $notes.addClass('hidden');
            }
        }
    }
    if (changed('metadata.describe.source-name') || changed('metadata.describe.source-url')) {
        if (attrs.metadata.describe['source-name'] && !$$('.source-block').length) return reload();
        if (!attrs.metadata.describe['source-name'] && $$('.source-block').length) return reload();
        $$('.source-block').html(
            dw.utils.purifyHtml(
                ($$('.source-block').data('src') || 'Source:') +
                    ' ' +
                    (attrs.metadata.describe['source-url']
                        ? '<a href="' + attrs.metadata.describe['source-url'] + '">' + attrs.metadata.describe['source-name'] + '</a>'
                        : attrs.metadata.describe['source-name'])
            )
        );
    }

    if (changed('metadata.describe.byline')) {
        if (attrs.metadata.describe.byline && !$$('.byline-block .chart-byline').length) return reload();
        if (!attrs.metadata.describe.byline && $$('.byline-block .chart-byline').length) return reload();
        $$('.byline-block .chart-byline').text(attrs.metadata.describe.byline);
    }

    function changed(key) {
        if (!win.__dw) return false;
        let p0 = win.__dw.old_attrs;
        let p1 = attrs;
        if (!p0) return true;
        key = key.split('.');
        _.each(key, function(k) {
            p0 = p0[k] || {};
            p1 = p1[k] || {};
        });
        return JSON.stringify(p0) !== JSON.stringify(p1);
    }

    function reload() {
        iframe.setAttribute('src', iframe.getAttribute('src').replace(/&random=\d+/, '&random=' + _.random(100000)));
    }

    function $$(sel) {
        return $(sel, doc);
    }
}
