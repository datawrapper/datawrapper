import { bench, describe } from 'vitest';
import { BaseJsonCRDT } from './BaseJsonCRDT';
import { nanoid } from 'nanoid';
import type { PreparedChart } from '../chartTypes';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';

const chartData = {
    publicId: 'rBHpV',
    language: 'en-US',
    theme: 'datawrapper',
    id: 'rBHpV',
    type: 'd3-lines',
    title: 'Test',
    lastEditStep: 3,
    publicVersion: 0,
    deleted: false,
    forkable: false,
    isFork: false,
    metadata: {
        data: {
            changes: [],
            transpose: false,
            'vertical-header': true,
            'horizontal-header': true
        },
        describe: {
            'source-name': 'Apple',
            'source-url': 'https://www.apple.com/newsroom/',
            intro: 'Apple sales by product in shipped units, 2000 to 2017.',
            byline: '',
            'aria-description': '',
            'number-format': '-',
            'number-divisor': 0,
            'number-append': '',
            'number-prepend': '',
            'hide-title': false
        },
        visualize: {
            'dark-mode-invert': true,
            'highlighted-series': [],
            'highlighted-values': [],
            sharing: {
                enabled: false,
                auto: true
            },
            rules: false,
            thick: false,
            'x-grid': 'off',
            'y-grid': 'on',
            'scale-y': 'linear',
            labeling: 'right',
            overlays: [],
            'sort-bars': false,
            background: false,
            'base-color': 0,
            'force-grid': false,
            'sort-areas': 'keep',
            'line-dashes': {},
            'line-widths': {},
            'stack-areas': true,
            'swap-labels': false,
            'area-opacity': 0.5,
            'block-labels': false,
            'custom-range': ['', ''],
            'label-colors': false,
            'label-margin': 0,
            'line-symbols': false,
            'range-extent': 'nice',
            'stack-to-100': false,
            'thick-arrows': false,
            'custom-colors': {},
            interpolation: 'linear',
            'reverse-order': false,
            'show-tooltips': true,
            'tick-position': 'top',
            'x-tick-format': 'auto',
            'y-grid-format': 'auto',
            'y-grid-labels': 'inside',
            'chart-type-set': true,
            'color-category': {
                map: {},
                categoryOrder: [
                    '2000 Q3',
                    '2000 Q4',
                    '2001 Q1',
                    '2001 Q2',
                    '2001 Q3',
                    '2001 Q4',
                    '2002 Q1',
                    '2002 Q2',
                    '2002 Q3',
                    '2002 Q4',
                    '2003 Q1',
                    '2003 Q2',
                    '2003 Q3',
                    '2003 Q4',
                    '2004 Q1',
                    '2004 Q2',
                    '2004 Q3',
                    '2004 Q4',
                    '2005 Q1',
                    '2005 Q2',
                    '2005 Q3',
                    '2005 Q4',
                    '2006 Q1',
                    '2006 Q2',
                    '2006 Q3',
                    '2006 Q4',
                    '2007 Q1',
                    '2007 Q2',
                    '2007 Q3',
                    '2007 Q4',
                    '2008 Q1',
                    '2008 Q2',
                    '2008 Q3',
                    '2008 Q4',
                    '2009 Q1',
                    '2009 Q2',
                    '2009 Q3',
                    '2009 Q4',
                    '2010 Q1',
                    '2010 Q2',
                    '2010 Q3',
                    '2010 Q4',
                    '2011 Q1',
                    '2011 Q2',
                    '2011 Q3',
                    '2011 Q4',
                    '2012 Q1',
                    '2012 Q2',
                    '2012 Q3',
                    '2012 Q4',
                    '2013 Q1',
                    '2013 Q2',
                    '2013 Q3',
                    '2013 Q4',
                    '2014 Q1',
                    '2014 Q2',
                    '2014 Q3',
                    '2014 Q4',
                    '2015 Q1',
                    '2015 Q2',
                    '2015 Q3',
                    '2015 Q4',
                    '2016 Q1',
                    '2016 Q2',
                    '2016 Q3',
                    '2016 Q4',
                    '2017 Q1',
                    '2017 Q2',
                    '2017 Q3',
                    '2017 Q4',
                    '2018 Q1',
                    '2018 Q2',
                    '2018 Q3',
                    '2018 Q4',
                    '2019 Q1',
                    '2019 Q2',
                    '2019 Q3',
                    '2019 Q4',
                    '2020 Q1',
                    '2020 Q2',
                    '2020 Q3',
                    '2020 Q4',
                    '2021 Q1',
                    '2021 Q2',
                    '2021 Q3',
                    '2021 Q4'
                ],
                categoryLabels: {},
                excludeFromKey: []
            },
            'custom-range-x': ['', ''],
            'custom-range-y': ['', ''],
            'custom-ticks-x': '',
            'custom-ticks-y': '',
            'show-color-key': false,
            'color-by-column': false,
            'connector-lines': true,
            'group-by-column': false,
            'label-alignment': 'left',
            'line-symbols-on': 'both',
            'value-label-row': false,
            'text-annotations': [],
            'tooltip-x-format': 'll',
            'y-grid-subdivide': true,
            'custom-area-fills': [],
            'custom-grid-lines': '',
            'date-label-format': 'YYYY',
            'line-symbols-size': 3.5,
            'line-value-labels': false,
            'range-annotations': [],
            'show-group-labels': true,
            'show-value-labels': true,
            'line-symbols-shape': 'circle',
            'value-label-format': '0,0.[00]',
            'y-grid-label-align': 'left',
            'area-separator-color': 0,
            'area-separator-lines': false,
            'compact-group-labels': false,
            'line-symbols-opacity': 1,
            'show-category-labels': true,
            'tooltip-number-format': '0,0.[00]',
            'value-label-alignment': 'left',
            'value-label-visibility': 'always',
            'tooltip-use-custom-formats': true,
            'line-symbols-shape-multiple': {}
        },
        axes: {
            x: 'Quarter'
        },
        publish: {
            'embed-width': 600,
            'embed-height': 410,
            blocks: {
                logo: {
                    id: 'datawrapper-logo',
                    enabled: false
                },
                embed: false,
                'download-pdf': false,
                'download-svg': false,
                'get-the-data': false,
                'download-image': false
            },
            'export-pdf': {},
            autoDarkMode: false,
            'chart-height': 295
        },
        annotate: {
            notes: 'Apple stopped to report iPod sales at the end of 2014.'
        },
        custom: {}
    },
    keywords:
        'apple sales by product in shipped units, 2000 to 2017.. . apple. . apple stopped to report ipod sales at the end of 2014.. ',
    utf8: false,
    createdAt: '2022-07-11T09:41:16.000Z',
    lastModifiedAt: '2022-07-14T09:59:21.000Z',
    forkedFrom: null,
    organizationId: null,
    authorId: 2,
    folderId: null
} satisfies PreparedChart;

function mockAnnotation() {
    return {
        id: nanoid(10),
        x: '2006/03/09 12:33',
        y: '101.0325',
        bg: false,
        dx: 0,
        dy: 0,
        bold: false,
        size: 14,
        text: 'Type your annotation text here',
        align: 'tl',
        color: false,
        width: 29.773960216998212,
        italic: false,
        underline: false,
        showMobile: true,
        showDesktop: true,
        connectorLine: {
            type: 'straight',
            circle: false,
            stroke: 1,
            enabled: false,
            arrowHead: 'lines',
            circleStyle: 'solid',
            circleRadius: 15,
            inheritColor: false,
            targetPadding: 4
        },
        mobileFallback: true
    };
}

// add more data to the basic opbject to make it more realistic
function addMoreData(chartData: PreparedChart, items: number) {
    const data = cloneDeep(chartData);
    for (let i = 0; i < items; i++) {
        data.metadata?.visualize?.['text-annotations']?.push(mockAnnotation());
        data.metadata?.visualize?.['range-annotations']?.push(mockAnnotation());
    }
    return data;
}

// generate a random update
function generateRandomUpdte() {
    const data = {};
    set(data, 'metadata.visualize.thick', true);
    set(data, 'metadata.describe.intro', 'Lorem ipsum');
    return data;
}

let crdt: BaseJsonCRDT;
const update = generateRandomUpdte();

describe.each([
    { size: 'small', chartData: addMoreData(chartData, 1) },
    { size: 'medium', chartData: addMoreData(chartData, 10) },
    { size: 'large', chartData: addMoreData(chartData, 100) }
])('$size chart', ({ chartData }) => {
    bench(
        'init',
        () => {
            // No change needed here, as 'init' benchmark creates a new CRDT instance each time
            new BaseJsonCRDT(chartData);
        },
        { time: 500 }
    );
    bench(
        'update',
        () => {
            // Use the newly generated update and the initialized crdt object
            crdt.update(update, '1-1');
        },
        {
            time: 500,
            setup: () => {
                crdt = new BaseJsonCRDT(chartData);
            }
        }
    );
    bench(
        'data',
        () => {
            // Use the initialized crdt object for the 'data' benchmark
            crdt.data();
        },
        {
            time: 500,
            setup: () => {
                crdt = new BaseJsonCRDT(chartData);
            }
        }
    );
});
