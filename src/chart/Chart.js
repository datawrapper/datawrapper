/* globals dw */
import { Store } from 'svelte/store.js';

import _ from 'underscore';

import delimited from './dataset/delimited.js';
import json from './dataset/json.js';
import reorderColumns from './dataset/reorderColumns.js';
import applyChanges from './dataset/applyChanges.js';
import addComputedColumns from './dataset/addComputedColumns.js';
import loadGlobalizeLocale from './locale/loadGlobalizeLocale.js';

import { patchJSON, putJSON } from '../shared/utils.js';
import { observeDeep } from 'svelte-extras';

const storeChanges = _.debounce((chart, callback) => {
    const state = chart.serialize();
    patchJSON(`//${dw.backend.__api_domain}/v3/charts/${state.id}`, JSON.stringify(state), () => {
        if (callback) callback();
    });
}, 1000);

const storeData = _.debounce((chart, callback) => {
    const data = chart.getMetadata('data.json') ? JSON.stringify(chart.dataset()) : chart.rawData();
    // const data = chart.rawData();
    putJSON(`/api/2/charts/${chart.get('id')}/data`, data, () => {
        if (callback) callback();
    });
}, 1000);

class Chart extends Store {
    // load the dataset
    load(csv, externalData) {
        const dsopts = {
            firstRowIsHeader: this.getMetadata('data.horizontal-header', true),
            transpose: this.getMetadata('data.transpose', false)
        };

        if (csv && !externalData) dsopts.csv = csv;
        else dsopts.url = externalData || 'data.csv';

        if (dsopts.csv) this._rawData = dsopts.csv;

        const datasource = this.getMetadata('data.json', false) ? json(dsopts) : delimited(dsopts);

        return datasource
            .dataset()
            .then(ds => {
                this.dataset(ds);
                // this.dataset(ds);
                // dataset_change_callbacks.fire(chart, ds);
                return ds;
            })
            .catch(e => {
                console.error('could not fetch datasource', e);
            });
    }

    // sets or returns the dataset
    dataset(ds) {
        // set a new dataset, or reset the old one if ds===true
        if (arguments.length) {
            if (ds !== true) this._dataset_cache = ds;
            const jsonData = ds !== true && typeof ds.list !== 'function';
            this._dataset = jsonData
                ? ds
                : reorderColumns(this, applyChanges(this, addComputedColumns(this, ds === true ? this._dataset_cache : ds)));
            if (jsonData) this.set({ dataset: ds });
            return this._dataset;
        }
        // return current dataset
        return this._dataset;
    }

    // sets or gets the theme
    theme(theme) {
        if (arguments.length) {
            // set new theme
            this.set({ theme });
            return this;
        }
        return this.get().theme;
    }

    // sets or gets the visualization
    vis(vis) {
        if (arguments.length) {
            // set new visualization
            this.set({ vis });
            return this;
        }
        return this.get().vis;
    }

    locale(locale, callback) {
        if (arguments.length) {
            this._locale = locale = locale.replace('_', '-');
            if (window.Globalize) {
                loadGlobalizeLocale(locale, callback);
            }
            // todo: what about momentjs & numeraljs?
        }
        return this._locale;
    }

    getMetadata(key = null, _default = null) {
        const { metadata } = this.get();
        if (!key) return metadata;
        // get metadata
        const keys = key.split('.');
        let pt = metadata;

        _.some(keys, key => {
            if (_.isUndefined(pt) || _.isNull(pt)) return true; // break out of the loop
            pt = pt[key];
            return false;
        });
        return _.isUndefined(pt) || _.isNull(pt) ? _default : pt;
    }

    setMetadata(key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        const { metadata } = this.get();
        let pt = metadata;

        // resolve property until the parent dict
        keys.forEach(key => {
            if (_.isUndefined(pt[key]) || _.isNull(pt[key])) {
                pt[key] = {};
            }
            pt = pt[key];
        });

        // check if new value is set
        if (!deepEqual(pt[lastKey], value)) {
            pt[lastKey] = value;
            this.set({ metadata });
        }
        return this;
    }

    // stores the state of this chart to server
    store(callback) {
        storeChanges(this, callback);
    }

    storeData(callback) {
        storeData(this, callback);
    }

    serialize() {
        const state = this.get();
        const keep = [
            'id',
            'title',
            'theme',
            'createdAt',
            'lastModifiedAt',
            'type',
            'metadata',
            'authorId',
            'showInGallery',
            'language',
            'guestSession',
            'lastEditStep',
            'publishedAt',
            'publicUrl',
            'publicVersion',
            'organizationId',
            'forkedFrom',
            'externalData',
            'forkable',
            'isFork',
            'inFolder',
            'author'
        ];
        const copy = {};
        keep.forEach(k => {
            copy[k] = state[k];
        });
        return copy;
    }

    passiveMode() {
        this.set({ passiveMode: true });
        setTimeout(() => this.set({ passiveMode: false }), 100);
    }

    isPassive() {
        return this.get().passiveMode;
    }

    rawData() {
        return this._rawData;
    }
}

Chart.prototype.observeDeep = observeDeep;

export default Chart;

function deepEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
