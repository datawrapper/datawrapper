export default function(chart, chartCont) {
    const keys = [
        {
            text: '.chart-title',
            block: '.dw-chart-header > h1',
            key: 'title'
        },
        {
            text: '.chart-intro',
            block: '.chart-intro',
            key: 'metadata.describe.intro'
        },
        {
            text: '.dw-chart-notes',
            block: '.dw-chart-notes',
            key: 'metadata.annotate.notes'
        },
        {
            text: '.byline-block .chart-byline',
            block: '.footer-block.byline-block',
            key: 'metadata.describe.byline'
        },
        {
            text: '.source-block a',
            block: '.footer-block.source-block',
            key: 'metadata.describe.source-name'
        },
        {
            text: '.source-block a',
            key: 'metadata.describe.source-url',
            href: true
        }
    ];

    keys.forEach(({ text, block, key, href }) => {
        const txt = chartCont.querySelector(text);
        const cont = chartCont.querySelector(block);

        if (!txt) return;

        chart.observeDeep(key, (value, old) => {
            if (chart.isPassive()) return;
            if (value !== old) {
                if (href) txt.setAttribute('href', value);
                else txt.innerHTML = value;
                if (cont) {
                    value = value && value.trim ? value.trim() : value;
                    old = old && old.trim ? old.trim() : old;
                    if (value && !old) {
                        cont.classList.remove('hidden');
                    } else if (!value && old) {
                        cont.classList.add('hidden');
                    }
                }
            }
        });
    });
}
