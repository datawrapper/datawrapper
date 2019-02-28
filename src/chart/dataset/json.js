/* globals fetch */

/*
 * dataset source for JSON data
 */
export default function(opts) {
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
        throw new Error('you need to provide either an URL or CSV data.');
    }

    return {
        dataset: loadAndParseJSON,
        parse: function() {
            return JSON.parse(opts.csv);
        }
    };
}
