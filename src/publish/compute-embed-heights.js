

const widths = [100,200,300,400,500,700,800,900,1000];

export default function() {
    const embedHeights = {};

    // compute embed deltas
    const $ = window.$;
    const previewChart = $($('#iframe-vis')[0].contentDocument);
    // find out default heights
    const defaultHeight = $('h1', previewChart).height() +
        $('.chart-intro', previewChart).height() +
        $('.dw-chart-notes', previewChart).height();

    const totalHeight = $('#iframe-vis').height();

    widths.forEach(width => {
        // now we resize headline, intro and footer
        previewChart.find('h1,.chart-intro,.dw-chart-notes')
            .css('width', width + "px");

        const height = $('h1', previewChart).height() +
            $('.chart-intro', previewChart).height() +
            $('.dw-chart-notes', previewChart).height();

        embedHeights[width] = totalHeight + (height - defaultHeight);
    });

    previewChart.find('h1,.chart-intro,.dw-chart-notes')
        .css('width', 'auto');

    return embedHeights;
}
