import dataset from './index.js';

/*
 * dataset source for JSON data
 */
function json(opts) {
    function loadAndParseJSON() {
        if (opts.url) {
            return fetch(opts.url)
                .then(res =>
                    res.ok
                        ? res
                        : Promise.reject(new Error(`Fetch failed with status ${res.status}`))
                )
                .then(res => res.text())
                .then(raw => {
                    return JSON.parse(raw);
                });
        } else if (opts.csv) {
            const dfd = new Promise(resolve => {
                resolve(opts.csv);
            });
            const parsed = dfd.then(raw => {
                return typeof raw === 'string' ? JSON.parse(raw) : raw;
            });
            return parsed;
        }
        const err = new Error('You need to provide either a URL or CSV data');
        return Promise.reject(err);
    }

    return {
        dataset: function () {
            return loadAndParseJSON().catch(e => {
                console.error(
                    `Could not fetch JSON data source for chart ${opts.chartId}, ` +
                        `returning an empty object: ${e.message}`
                );
                return {};
            });
        },
        parse: function () {
            return JSON.parse(opts.csv);
        },
    };
}

dataset.json = json;

export default json;
