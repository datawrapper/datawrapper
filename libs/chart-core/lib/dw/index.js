/* eslint-env node */
import dataset from './dataset/index.js';
import column from './dataset/column.js';
import delimited from './dataset/delimited.js';
import columnTypes from './dataset/columnTypes/index.js';
import json from './dataset/json.js';
import * as utils from './utils/index.js';
import chart from './chart.js';
import visualization from './visualization.js';
import theme from './theme.js';
import block from './block.js';
import notify from './notify.js';

column.types = columnTypes;

// dw.start.js
const dw = {
    version: 'chart-core@__chartCoreVersion__',
    dataset,
    column,
    datasource: {
        delimited,
        json
    },
    utils,
    chart,
    visualization,
    theme,
    block,
    notify
};

if (typeof exports !== 'undefined') {
    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = dw;
    }
    exports.dw = dw;
} else {
    // Browser, merge into existing window.dw scope, prioritizing
    // pre-existing properties
    window.dw = {
        ...dw,
        ...(window.dw || {})
    };
}

export default dw;
