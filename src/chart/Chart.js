import { Store } from 'svelte/store.js';

import _some from 'underscore-es/some';
import _isUndefined from 'underscore-es/isUndefined';
import _isNull from 'underscore-es/isNull';
import _debounce from 'underscore-es/debounce';

import delimited from './dataset/delimited.js';
import reorderColumns from './dataset/reorderColumns.js';
import applyChanges from './dataset/applyChanges.js';
import addComputedColumns from './dataset/addComputedColumns.js';
import loadGlobalizeLocale from './locale/loadGlobalizeLocale.js';

import {putJSON} from '../shared/utils.js';
import clone from '../shared/clone.js';

const storeChanges = _debounce((chart, callback) => {
    const state = chart.serialize();
    putJSON(`/api/2/charts/${state.id}`, JSON.stringify(state), () => {
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

        const datasource = delimited(dsopts);

        return datasource.dataset().then((ds) => {
            this.dataset(ds);
            // this.dataset(ds);
            // dataset_change_callbacks.fire(chart, ds);
            return ds;
        }).catch((e) => {
            console.log('nope', e)
        });
    }

    // sets or returns the dataset
    dataset(ds) {
        // set a new dataset, or reset the old one if ds===true
        if (arguments.length) {
            if (ds !== true) this._dataset_cache = ds;
            this._dataset =
                reorderColumns(this,
                applyChanges(this,
                addComputedColumns(this, ds === true ? this._dataset_cache : ds)));
            return this._dataset;
        }
        // return current dataset
        return this._dataset;
    }

    // sets or gets the theme
    theme(theme) {
        if (arguments.length) {
            // set new theme
            this.set({theme});
            return this;
        }
        return this.get().theme;
    }

    // sets or gets the visualization
    vis(vis) {
        if (arguments.length) {
            // set new visualization
            this.set({vis});
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

    getMetadata(key=null, _default=null) {
        const {metadata} = this.get();
        if (!key) return metadata;
        // get metadata
        const keys = key.split('.');
        let pt = metadata;

        _some(keys, key => {
            if (_isUndefined(pt) || _isNull(pt)) return true; // break out of the loop
            pt = pt[key];
            return false;
        });
        return _isUndefined(pt) || _isNull(pt) ? _default : pt;
    }

    setMetadata(key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        const {metadata} = this.get();
        let pt = metadata;

        // resolve property until the parent dict
        keys.forEach(key => {
            if (_isUndefined(pt[key]) || _isNull(pt[key])) {
                pt[key] = {};
            }
            pt = pt[key];
        });

        // check if new value is set
        if (!is_equal(pt[lastKey], value)) {
            pt[lastKey] = value;
            this.set({metadata});
        }
        return this;
    }

    // stores the state of this chart to server
    store(callback) {
        storeChanges(this, callback);
    }

    serialize() {
        const state = this.get();
        const keep = [
            'id', 'title', 'theme', 'createdAt', 'lastModifiedAt', 'type', 'metadata',
            'authorId', 'showInGallery', 'language', 'guestSession', 'lastEditStep',
            'publishedAt', 'publicUrl', 'publicVersion', 'organizationId', 'forkedFrom',
            'externalData', 'forkable', 'isFork', 'inFolder', 'author'
        ];
        const copy = {};
        keep.forEach(k => {
            copy[k] = state[k];
        });
        return copy;
    }
}

export default Chart;

function is_equal(a, b) {
    return JSON.stringify(a) == JSON.stringify(b);
}
