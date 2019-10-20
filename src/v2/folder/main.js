import App from './App.html';

import { Store } from 'svelte/store.js';
const store = new Store({});

const data = {
    chart: {
        id: ''
    }
};

export default { App, data, store };
