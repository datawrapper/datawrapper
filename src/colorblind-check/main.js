import App from './ColorblindCheck.html';
import { Store } from 'svelte/store.js';

const store = new Store({});

function init(app) {
    /* globals chart */
    window.dw.backend
        .on('dataset-loaded', function () {
            app.store.set({ dataset: chart.dataset() });
        })
        .on('theme-changed-and-loaded', function () {
            app.store.set({ theme: window.dw.theme(chart.get('theme')) });
        })
        .on('backend-vis-loaded', function (vis) {
            app.store.set({ vis: vis });
        });
}

const data = {
    chart: {
        id: ''
    }
};

export default { App, init, data, store };
