export default function(chart, chartCont) {

    const keys = [
        {
            text: '.chart-title',
            block: '.dw-chart-header > h1',
            key: 'title'
        }, {
            text: '.chart-intro',
            block: '.chart-intro',
            key: 'metadata.describe.intro'
        }, {
            text: '.dw-chart-notes',
            block: '.dw-chart-notes',
            key: 'metadata.annotate.notes'
        }
    ];

    keys.forEach(({text, block, key}) => {
        const txt = chartCont.querySelector(text);
        const cont = chartCont.querySelector(block);

        chart.observeDeep(key, (value, old) => {
            if (chart.isPassive()) return;
            if (value != old) {
                txt.innerHTML = value;
                if (value && !old) {
                    cont.classList.remove('hidden');
                } else if (!value && old) {
                    cont.classList.add('hidden');
                }
            }
        });
    });

}
