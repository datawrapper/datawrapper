/*
* dataset source for JSON
*/

/* globals dw,$,_ */

dw.datasource.json = function(opts) {

    function loadAndParseJSON() {
        if (opts.url) {
            // todo fetch
        } else if (opts.csv || opts.json) {
            var dfd = $.Deferred(),
                parsed = dfd.then(function(raw) {
                    return JSON.parse(raw);
                });
            dfd.resolve(opts.csv || opts.json);
            return parsed;
        }
        throw 'you need to provide either an URL or CSV data.';
    }

    return {
        dataset: loadAndParseJSON,
        parse: function() {
            return JSON.parse(opts.csv || opts.json);
        }
    };
};

