export function outerHeight(element, withMargin = false) {
    if (!element) return null;
    let height = element.offsetHeight;
    if (!withMargin) return height;
    var style = getComputedStyle(element);
    height += parseInt(style.marginTop) + parseInt(style.marginBottom);
    return height;
}

export function getNonChartHeight() {
    let h = 0;

    let chart = document.querySelector('.dw-chart .dw-chart-styles');
    if (!chart) {
        // try if we're dealing with a v2 theme:
        chart = document.querySelector('.dw-chart .container-body');
        return chart ? getNonChartHeightV2(chart) : 0;
    }
    for (let i = 0; i < chart.children.length; i++) {
        const el = chart.children[i];
        const tagName = el.tagName.toLowerCase();
        if (
            tagName !== 'script' &&
            tagName !== 'style' &&
            el.id !== 'chart' &&
            !hasClass(el, 'tooltip') &&
            !hasClass(el, 'vg-tooltip') &&
            !hasClass(el, 'hidden') &&
            !hasClass(el, 'sr-only') &&
            !hasClass(el, 'qtip') &&
            !hasClass(el, 'container') &&
            !hasClass(el, 'noscript') &&
            !hasClass(el, 'invisible') &&
            !hasClass(el, 'dw-after-body') &&
            !hasClass(el, 'dw-chart-body')
        ) {
            h += Number(outerHeight(el, true));

            if (hasClass(el, 'dw-chart-header')) {
                const filter = el.querySelector('.filter-ui');
                if (filter) h -= Number(outerHeight(filter, true));
            }
        }
    }

    function hasClass(el, className) {
        return el.classList.contains(className);
    }

    function getProp(selector, property) {
        return getComputedStyle(document.querySelector(selector))[property].replace('px', '');
    }

    const selectors = ['.dw-chart', '.dw-chart-styles', '.dw-chart-body', 'body'];
    const properties = [
        'padding-top',
        'padding-bottom',
        'margin-top',
        'margin-bottom',
        'border-top-width',
        'border-bottom-width'
    ];

    selectors.forEach(function (sel) {
        properties.forEach(function (prop) {
            h += Number(getProp(sel, prop));
        });
    });

    return h;
}

function getNonChartHeightV2(body) {
    // TODO
    // Here we're just assuming that the default footer container is underneath
    // the chart body
    const height = outerHeight(body, true) - outerHeight(body.querySelector('#chart'), true);
    return height;
}
