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

    const chart = document.querySelector('.dw-chart');
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
            !hasClass(el, 'hidden') &&
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

    const selectors = ['.dw-chart', '.dw-chart-body', 'body'];
    const properties = [
        'padding-top',
        'padding-bottom',
        'margin-top',
        'margin-bottom',
        'border-top-width',
        'border-bottom-width'
    ];

    selectors.forEach(function(sel) {
        properties.forEach(function(prop) {
            h += Number(getProp(sel, prop));
        });
    });

    return h;
}
