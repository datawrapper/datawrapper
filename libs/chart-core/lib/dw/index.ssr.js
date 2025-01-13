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
export default {
    dataset,
    column,
    datasource: {
        delimited,
        json,
    },
    utils,
    chart,
    visualization,
    theme,
    block,
    notify,
};
