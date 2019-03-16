/* globals chart */
import App from './App.html';

import { Store } from 'svelte/store.js';

const store = new Store({});

const data = {
    chart: {
        id: ''
    }
};

function init(app) {
    window.dw.backend
        .on('dataset-loaded', function() {
            app.store.set({ dataset: chart.dataset() });
        })
        .on('theme-changed-and-loaded', function() {
            app.store.set({ theme: window.dw.theme(chart.get('theme')) });
        })
        .on('backend-vis-loaded', function(vis) {
            app.store.set({ vis: vis });
        });
}

export default { App, data, store, init };
