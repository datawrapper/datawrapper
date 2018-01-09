

const widths = [100,200,300,400,500,700,800,900,1000];

export default function(chart, embed_templates) {
    const publish = chart.get('metadata.publish');
    const codes = {};
    let embedDeltas = false;

    embed_templates.forEach((tpl) => {
        var embedCode = tpl.template
            .replace(/%chart_url%/g, chart.get('publicUrl') || '')
            .replace(/%chart_width%/g, publish['embed-width'])
            .replace(/%chart_height%/g, publish['embed-height'])
            .replace(/%chart_id%/g, chart.get('id'));

        if (embedCode.indexOf('%embed_heights%') > -1) {
            if (!embedDeltas) {
                embedDeltas = {};
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

                    embedDeltas[width] = totalHeight + (height - defaultHeight);
                });

                // reset widths
                previewChart.find('h1, .chart-intro, .dw-chart-notes')
                    .css('width', "");

                embedCode = embedCode
                    .replace(/%embed_heights_escaped%/g, JSON.stringify(embedDeltas).replace(/"/g, "&quot;"))
                    .replace(/%embed_heights%/g, JSON.stringify(embedDeltas));
            }
        }

        codes['embed-method-'+tpl.id] = embedCode;
    });
    return codes;
}

// function updateEmbedCode(chart, hasNewLink) {
//     var embedCodes = $('.embed-holder > div'),
//         codes = {};

//     embedCodes.each(function(i, el) {
//         var embedCodeTpl = $(el).data('tpl'),
//           embedInput = $(el).find('input[type="text"]'),
//           embedCopyBtn = $(el).find('.copy-button'),
//           publish = chart.get('metadata.publish');

//         $('#embed-width', modal).val(publish['embed-width']);
//         $('#embed-height', modal).val(publish['embed-height']);

//         var embedCode = embedCodeTpl
//             .replace('%chart_url%', chart.get('publicUrl') || '')
//             .replace('%chart_width%', publish['embed-width'])
//             .replace('%chart_height%', publish['embed-height'])
//             .replace(/%chart_id%/g, chart.get('id'));

//         if (embedCodeTpl.indexOf("embed_heights") > -1) {
//             var embedDeltas = {
//                 100: 0,
//                 200: 0,
//                 300: 0,
//                 400: 0,
//                 500: 0,
//                 600: 0,
//                 700: 0,
//                 800: 0,
//                 900: 0,
//                 1000: 0,
//             };

//             var previewChart = $($('#iframe-vis')[0].contentDocument);

//             var defaultHeight = $('h1', previewChart).height()
//                          + $('.chart-intro', previewChart).height()
//                          + $('.dw-chart-notes', previewChart).height();

//             var totalHeight = $('#iframe-vis').height();

//             for (var width in embedDeltas) {
//                 previewChart.find('h1, .chart-intro, .dw-chart-notes').css('width', width + "px");

//                 var height = $('h1', previewChart).height()
//                              + $('.chart-intro', previewChart).height()
//                              + $('.dw-chart-notes', previewChart).height();

//                 embedDeltas[width] = totalHeight + (height - defaultHeight);
//             }

//             previewChart.find('h1, .chart-intro, .dw-chart-notes').css('width', "");
//             embedCode = embedCode.replace('%embed_heights_escaped%', JSON.stringify(embedDeltas).replace(/"/g, "&quot;"))
//             embedCode = embedCode.replace('%embed_heights%', JSON.stringify(embedDeltas));
//         }

//         embedInput.val(embedCode);
//         codes[$(el).attr("id")] = embedCode;

//         embedCopyBtn.click(function(evt) {
//             evt.preventDefault();
//             embedInput.select();
//             try {
//                 var successful = document.execCommand('copy');
//                 var msg = successful ? 'successful' : 'unsuccessful';
//                 console.log('Copying text command was ' + msg);
//                 if (successful) {
//                     var copySuccess = $('.copy-success', modal);
//                     copySuccess.removeClass('hidden').show();
//                     copySuccess.fadeOut(2000);
//                 }
//             } catch (err) {
//                 // console.log('Oops, unable to copy');
//             }
//         });

//     });

//     if (hasNewLink) chart.set("metadata.publish.embed-codes", codes);
// }
