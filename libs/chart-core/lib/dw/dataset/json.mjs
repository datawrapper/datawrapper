import dataset from './index.mjs';

/*
 * dataset source for JSON data
 */
function json(opts) {
    function loadAndParseJSON() {
        if (opts.url) {
            return fetch(opts.url)
                .then(res => res.text())
                .then(raw => {
                    return JSON.parse(raw);
                });
        } else if (opts.csv) {
            const dfd = new Promise(resolve => {
                resolve(opts.csv);
            });
            const parsed = dfd.then(raw => {
                return JSON.parse(raw);
            });
            return parsed;
        }
        const err = new Error('You need to provide either a URL or CSV data');
        return Promise.reject(err);
    }

    return {
        dataset: function () {
            return loadAndParseJSON().catch(e => {
                console.error('could not fetch datasource, returning an empty object', e);
                return {};
            });
        },
        parse: function () {
            return JSON.parse(opts.csv);
        }
    };
}

dataset.json = json;

export default json;
