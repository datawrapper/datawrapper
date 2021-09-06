/* eslint-env node */
import dataset from './dataset/index.mjs';
import column from './dataset/column.mjs';
import delimited from './dataset/delimited.mjs';
import columnTypes from './dataset/columnTypes/index.mjs';
import json from './dataset/json.mjs';
import * as utils from './utils/index.mjs';
import chart from './chart.mjs';
import visualization from './visualization.mjs';
import theme from './theme.mjs';
import block from './block.mjs';
import notify from './notify.mjs';

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
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = dw;
    }
    exports.dw = dw;
} else {
    window.dw = dw;
}

export default dw;
