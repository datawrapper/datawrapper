import test from 'ava';
import Chart from './Chart.js';
import { Store } from 'svelte/store.js';

const chartJSON = {
    id: 'MD35m',
    title: 'Majority of EU citizens in favor of abolishing Daylight Saving Time',
    theme: 'datawrapper',
    createdAt: '2018-09-01 08:28:56',
    lastModifiedAt: '2018-09-01 08:30:54',
    type: 'd3-bars-stacked',
    metadata: {
        data: { transpose: false, 'vertical-header': true, 'horizontal-header': true },
        visualize: {
            'highlighted-series': ['EU-28'],
            'highlighted-values': [],
            rules: false,
            thick: false,
            'x-grid': 'off',
            'y-grid': 'on',
            'scale-y': 'linear',
            'sort-by': 'Keep',
            labeling: 'right',
            'sort-asc': true,
            'color-key': {
                Keep: { col: '#ffe59c', color: '#ffe59c', label: 'Keep' },
                bars: { color: '#18a1cd', label: 'Abolish', def_lbl: 'bars' },
                Abolish: { col: '#c71e1d', color: '#c71e1d', label: 'Abolish' }
            },
            'sort-bars': 'keep',
            background: false,
            'force-grid': false,
            'resort-bars': false,
            'swap-labels': false,
            'block-labels': false,
            'fill-between': false,
            'label-colors': false,
            'label-margin': 0,
            'line-symbols': false,
            'custom-colors': { Keep: '#ffe59c', Abolish: '#c71e1d' },
            interpolation: 'linear',
            'show-tooltips': true,
            'x-tick-format': 'YYYY',
            'y-grid-format': '0,0.[00]',
            'y-grid-labels': 'auto',
            'show-color-key': false,
            'label-alignment': 'left',
            'line-symbols-on': 'both',
            'y-grid-subdivide': true,
            'custom-grid-lines': '',
            'date-label-format': 'YYYY',
            'hide-group-labels': true,
            'hide-value-labels': false,
            'line-symbols-size': 3.5,
            'line-value-labels': false,
            'stack-percentages': false,
            'line-symbols-shape': 'circle',
            'value-label-format': '0%',
            'y-grid-label-align': 'left',
            'line-symbols-opacity': 1,
            'area-fill-color-below': '#cccccc',
            'value-label-alignment': 'left',
            'area-fill-color-between': '#cccccc'
        },
        describe: {
            'source-name': 'European Comission',
            'source-url': 'http://europa.eu/rapid/press-release_IP-18-5302_en.htm',
            'number-format': '-',
            'number-divisor': 0,
            'number-append': '',
            'number-prepend': '',
            intro:
                'Of the 4.6 million EU citizens who participated in a public consultation, <b>84 percent</b> are saying they are in favor of abolishing daylight savings.'
        },
        publish: { 'embed-width': '400', 'embed-height': 876, 'chart-height': 722 },
        axes: { groups: 'Group' },
        json_error: null
    },
    authorId: 29,
    showInGallery: true,
    language: 'en-US',
    guestSession: null,
    lastEditStep: 3,
    publishedAt: null,
    publicUrl: 'http://charts.datawrapper.local/MD35m/index.html',
    publicVersion: 0,
    organizationId: null,
    forkedFrom: null,
    externalData: null,
    forkable: false,
    isFork: false,
    inFolder: null,
    author: {
        id: 29,
        email: 'gka@vis4.net',
        name: 'Gregor Aisch',
        website: null,
        socialmedia: null
    }
};

const chartData = `Country\tGroup\tAbolish\tKeep
EU-28\tA\t84\t16
Finland\tB\t95\t5
Poland\tB\t95\t5
Spain\tB\t93\t7
Lithuania\tB\t91\t9
Croatia\tB\t90\t10
Hungary\tB\t90\t10
Ireland\tB\t88\t12
Sweden\tB\t88\t12
Slovenia\tB\t87\t13
Estonia\tB\t85\t15
Latvia\tB\t85\t15
Portugal\tB\t85\t15
Belgium\tB\t84\t16
Bulgaria\tB\t84\t16
France\tB\t84\t16
Germany\tB\t84\t16
Czech Republic\tB\t83\t17
United Kingdom\tB\t82\t18
Denmark\tB\t81\t19
Slovakia\tB\t80\t20
Luxembourg\tB\t79\t21
Netherlands\tB\t79\t21
Romania\tB\t78\t22
Austria\tB\t77\t23
Italy\tB\t66\t34
Malta\tB\t54\t46
Cyprus\tB\t47\t53
Greece\tB\t44\t56`;

const chart = new Chart(chartJSON);

test('chart instance of svelte/store', t => {
    t.true(chart instanceof Store);
});

test('chart instance of Chart', t => {
    t.true(chart instanceof Chart);
});

test('chart.get()', t => {
    t.is(chart.get().id, 'MD35m');
    t.is(chart.get().title, 'Majority of EU citizens in favor of abolishing Daylight Saving Time');
});

test('chart.getMetadata()', t => {
    t.is(chart.getMetadata('visualize.x-grid'), 'off');
});

test('chart.setMetadata()', t => {
    chart.setMetadata('visualize.x-grid', 'on');
    t.is(chart.getMetadata('visualize.x-grid'), 'on');
});

test('chart.load()', async t => {
    const dataset = await chart.load(chartData);
    t.is(dataset.numColumns(4), 4);
});
