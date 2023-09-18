export function outerHeight(element, withMargin = false) {
    if (!element) return null;
    const height = element.offsetHeight;
    if (!withMargin) return height;
    const style = getComputedStyle(element);
    const margin = parseInt(style.marginTop) + parseInt(style.marginBottom);
    return height + (withMargin ? margin : 0);
}

export function getNonChartHeight(rootNode = document) {
    // TODO: replace this function with getNonChartHeightV2 as soon
    // as all themes have been migrated to v2
    const isWebComponent = rootNode.nodeName === '#document-fragment';
    let h = 0;

    let chart = rootNode.querySelector('.dw-chart .dw-chart-styles');
    if (!chart) {
        // try if we're dealing with a v2 theme:
        chart = rootNode.querySelector('.dw-chart .container-body');
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
        return getComputedStyle(rootNode.querySelector(selector))[property].replace('px', '');
    }

    const selectors = [
        '.dw-chart',
        '.dw-chart-styles',
        '.dw-chart-body',
        isWebComponent ? '.web-component-body' : 'body'
    ];
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

function getNonChartHeightV2(container) {
    // TODO: For now we're just assuming that the "non-chart" elements are all placed
    // either above or below the chart container. In a theme where we'd have a multi
    // column layout in which the chart container is just one column, this would not
    // work and we'd need to find a different solution
    const body = container.getRootNode().body;
    const height =
        outerHeight(container, true) -
        outerHeight(container.querySelector('.dw-chart-body-content'), true) +
        // inside the chart editor we sometimes have 10px padding bottom
        // that we need to subtract from the chart height by adding it here
        (body ? parseInt(getComputedStyle(body).paddingBottom) : 0);
    return height;
}
