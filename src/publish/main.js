import App from './App.html';

import { Store } from 'svelte/store.js';

const globals = new Store({});

var app = new App({
    target: document.querySelector('.svelte-publish'),
    store: globals,
    data: {
        chart: {
            id: ''
        },
        embed_templates: [],
        published: false,
        publishing: false,
        needs_republish: false,
        progress: 0,
        shareurl_type: 'standalone',
        embed_type: 'responsive',
        copy_success: false
    }
});


export default app;
