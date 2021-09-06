import { Store } from 'svelte2/store.umd.js';
import { observeDeep } from 'svelte-extras';
import { throttle, some, isUndefined, isNull, isEqual } from 'underscore';
import { put } from '@datawrapper/shared/httpReq.js';

import delimited from './dataset/delimited.mjs';
import json from './dataset/json.mjs';
import reorderColumns from './dataset/reorderColumns.mjs';
import applyChanges from './dataset/applyChanges.mjs';
import addComputedColumns from './dataset/addComputedColumns.mjs';

const storeChanges = throttle((chart, callback) => {
    const state = chart.serialize();

    put(`/v3/charts/${state.id}`, { payload: state })
        .then(attributes => {
            chart.fire('save', attributes);
            if (callback) callback();
        })
        .catch(e => {
            console.error('Could not store chart changes', e);
        });
}, 1000);

const storeData = throttle((chart, callback) => {
    const data = chart.getMetadata('data.json') ? JSON.stringify(chart.dataset()) : chart.rawData();
    // const data = chart.rawData();
    put(`/v3/charts/${chart.get().id}/data`, {
        body: data,
        headers: {
            'Content-Type': 'text/csv'
        }
    })
        .then(() => {
            if (callback) callback();
        })
        .catch(e => {
            console.error('Could not store chart data', e);
        });
}, 1000);

class Chart extends Store {
    /*
     * load a csv or json dataset
     */
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
            else ds = this._dataset_cache;
            const jsonData = typeof ds.list !== 'function';
            this._dataset = jsonData
                ? ds
                : reorderColumns(this, applyChanges(this, addComputedColumns(this, ds)));
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
        }
        if (typeof callback === 'function') callback();
        return this._locale;
    }

    getMetadata(key = null, _default = null) {
        const { metadata } = this.get();
        if (!key) return metadata;
        // get metadata
        const keys = key.split('.');
        let pt = metadata;

        some(keys, key => {
            if (isUndefined(pt) || isNull(pt)) return true; // break out of the loop
            pt = pt[key];
            return false;
        });
        return isUndefined(pt) || isNull(pt) ? _default : pt;
    }

    setMetadata(key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        const { metadata } = this.get();
        let pt = metadata;

        // resolve property until the parent dict
        keys.forEach(key => {
            if (isUndefined(pt[key]) || isNull(pt[key])) {
                pt[key] = {};
            }
            pt = pt[key];
        });

        // check if new value is set
        if (!isEqual(pt[lastKey], value)) {
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
