import App from './App.html';

import { Store } from 'svelte/store.js';
const store = new Store({});

const data = {
    chart: {
        id: ''
    },
    readonly: false,
    chartData: '',
    transpose: false,
    firstRowIsHeader: true,
    skipRows: 0
};

export default { App, data, store };
