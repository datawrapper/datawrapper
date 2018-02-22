import App from './App.html';

import { Store } from 'svelte/store.js';

const store = new Store({});

var app = new App({
    target: document.querySelector('.svelte-highlight'),
    store: store,
    data: {
        chart: {
            id: ''
        },
    }
});

window.dw.backend
    .on('dataset-loaded', function() {
        app.store.set({dataset: chart.dataset()});
    })
    .on('theme-changed-and-loaded', function() {
        app.store.set({theme: window.dw.theme(chart.get('theme')) });
    })
    .on('backend-vis-loaded', function(vis) {
        app.store.set({vis: vis});
    });

export default app;
