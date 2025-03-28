/*
 * dataset source for delimited files (CSV, TSV, ...)
 */

/**
 * Smart delimited data parser.
 * - Handles CSV and other delimited data.
 * Includes auto-guessing of delimiter character
 * Parameters:
 *   options
 *     delimiter : ","
 */

import isString from 'lodash/isString.js';
import dataset from './index.js';
import column from './column.js';

/**
 * Parses a separator-delimited string (e.g. CSV)
 *
 * @param {object} opts
 * @param {string} opts.csv - the CSV string to be parsed
 * @param {string} [opts.delimiter] - defaults to 'auto'
 * @param {string} [opts.quoteChar]
 * @param {number} [opts.skipRows] - number of initial rows to skip
 * @param {*} [opts.emptyValue]
 * @param {boolean} [opts.transpose]
 * @param {boolean} [opts.firstRowIsHeader]
 * @param {string} [opts.allowedTags] - list of HTML tags that will not get filtered out by purifyHTML
 * @return {Dataset}
 */
export default function delimited(opts) {
    function loadAndParseCsv() {
        if (opts.url) {
            if (opts.loadDataWithTimestamp === undefined ? true : opts.loadDataWithTimestamp) {
                const ts = new Date().getTime();
                opts.url += `${opts.url.includes('?') ? '&' : '?'}v=${
                    opts.url.includes('//static.dwcdn.net') ? ts - (ts % 60000) : ts
                }`;
            }
            return window
                .fetch(opts.url)
                .then(res =>
                    res.ok
                        ? res
                        : Promise.reject(new Error(`Fetch failed with status ${res.status}`))
                )
                .then(res => res.text())
                .then(raw => {
                    return new DelimitedParser(opts).parse(raw);
                });
        } else if (opts.csv || opts.csv === '') {
            const dfd = new Promise(resolve => {
                resolve(opts.csv);
            });
            const parsed = dfd.then(raw => {
                return new DelimitedParser(opts).parse(raw);
            });
            return parsed;
        }
        const err = new Error('You need to provide either a URL or CSV data');
        return Promise.reject(err);
    }

    return {
        dataset: function () {
            return loadAndParseCsv().catch(e => {
                console.error(
                    `Could not fetch delimited data source for chart ${opts.chartId}, ` +
                        `returning an empty dataset: ${e.message}`
                );
                return dataset([]);
            });
        },
        parse: function () {
            return new DelimitedParser(opts).parse(opts.csv);
        },
    };
}

dataset.delimited = delimited;

export class DelimitedParser {
    constructor(opts) {
        opts = Object.assign(
            {
                delimiter: 'auto',
                quoteChar: '"',
                skipRows: 0,
                emptyValue: null,
                transpose: false,
                firstRowIsHeader: true,
            },
            opts
        );

        this.__delimiterPatterns = getDelimiterPatterns(opts.delimiter, opts.quoteChar);
        this.opts = opts;
    }

    parse(data) {
        this.__rawData = data;
        const opts = this.opts;

        if (opts.delimiter === 'auto') {
            opts.delimiter = this.guessDelimiter(data, opts.skipRows);
            this.__delimiterPatterns = getDelimiterPatterns(opts.delimiter, opts.quoteChar);
        }
        const closure = opts.delimiter !== '|' ? '|' : '#';
        let arrData;

        data = closure + '\n' + data.replace(/[ \r\n\f]+$/g, '').replace(/^\uFEFF/, '') + closure;

        function parseCSV(delimiterPattern, strData, strDelimiter) {
            // implementation and regex borrowed from:
            // http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm

            // Check to see if the delimiter is defined. If not,
            // then default to comma.
            strDelimiter = strDelimiter || ',';

            // Create an array to hold our data. Give the array
            // a default empty first row.
            const arrData = [[]];

            // Create an array to hold our individual pattern
            // matching groups.
            let arrMatches = null;
            let strMatchedValue;

            // Keep looping over the regular expression matches
            // until we can no longer find a match.
            while ((arrMatches = delimiterPattern.exec(strData))) {
                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[1];

                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push([]);
                }

                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[2]) {
                    // We found a quoted value. When we capture
                    // this value, unescape any double quotes.
                    strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
                } else {
                    // We found a non-quoted value.
                    strMatchedValue = arrMatches[3];
                }

                // Now that we have our value string, let's add
                // it to the data array.
                arrData[arrData.length - 1].push(
                    strMatchedValue === undefined ? '' : strMatchedValue
                );
            }

            // remove closure
            if (arrData[0][0].substr(0, 1) === closure) {
                arrData[0][0] = arrData[0][0].substr(1);
            }
            const p = arrData.length - 1;
            const q = arrData[p].length - 1;
            const r = arrData[p][q].length - 1;
            if (arrData[p][q].substr(r) === closure) {
                arrData[p][q] = arrData[p][q].substr(0, r);
            }

            // Return the parsed data.
            return arrData.slice(1);
        } // end parseCSV

        function transpose(arrMatrix) {
            // borrowed from:
            // http://www.shamasis.net/2010/02/transpose-an-array-in-javascript-and-jquery/
            const a = arrMatrix;
            const w = a.length ? a.length : 0;
            const h = a[0] instanceof Array ? a[0].length : 0;
            if (h === 0 || w === 0) {
                return [];
            }
            let i, j;
            const t = [];
            for (i = 0; i < h; i++) {
                t[i] = [];
                for (j = 0; j < w; j++) {
                    t[i][j] = a[j][i];
                }
            }
            return t;
        }

        function makeColumns(arrData) {
            if (!arrData) {
                return [];
            }
            arrData = arrData.slice(opts.skipRows);
            if (!arrData.length) {
                return [];
            }

            // compute series
            const firstRow = arrData[0];
            const columnNames = {};
            let srcColumns = [];
            let rowIndex = 0;
            if (opts.firstRowIsHeader) {
                srcColumns = arrData[rowIndex];
                rowIndex++;
                arrData.shift();
            }

            return firstRow.map((_, i) => {
                const data = arrData.map(row => (row[i] !== '' ? row[i] : opts.emptyValue));
                let col = isString(srcColumns[i]) ? srcColumns[i].replace(/^\s+|\s+$/g, '') : '';
                let suffix = col !== '' ? '' : 1;
                col = col !== '' ? col : 'X.';
                while (columnNames[col + suffix] !== undefined) {
                    suffix = suffix === '' ? 1 : suffix + 1;
                }
                columnNames[col + suffix] = true;
                return column(col + suffix, data, undefined, opts.allowedTags);
            });
        }

        function makeDataset(arrData) {
            const columns = makeColumns(arrData);
            return dataset(columns);
        }

        arrData = parseCSV(this.__delimiterPatterns, data, opts.delimiter);
        if (opts.transpose) {
            arrData = transpose(arrData);
        }
        return makeDataset(trimArrayData(arrData));
    } // end parse

    guessDelimiter(strData) {
        // find delimiter which occurs most often
        let maxMatchCount = 0;
        let k = -1;
        const me = this;
        const delimiters = ['\t', ';', '|', ','];
        delimiters.forEach((delimiter, i) => {
            const regex = getDelimiterPatterns(delimiter, me.quoteChar);
            let c = strData.match(regex).length;
            if (delimiter === '\t') c *= 1.15; // give tab delimiters more weight
            if (c > maxMatchCount) {
                maxMatchCount = c;
                k = i;
            }
        });
        return delimiters[k];
    }
}

function getDelimiterPatterns(delimiter, quoteChar) {
    return new RegExp(
        // Delimiters.
        '(\\' +
            delimiter +
            '|\\r?\\n|\\r|^)' +
            // Quoted fields.
            '(?:' +
            quoteChar +
            '([^' +
            quoteChar +
            ']*(?:' +
            quoteChar +
            '"[^' +
            quoteChar +
            ']*)*)' +
            quoteChar +
            '|' +
            // Standard fields.
            '([^\\' +
            delimiter +
            '\\r\\n]*))',
        'gi'
    );
}

function trimArrayData(arrData) {
    for (let i = arrData.length - 1; i >= 0; i--) {
        if (arrData[i].some(col => col !== '')) {
            return arrData.slice(0, i + 1);
        }
    }
    return arrData.slice(0, 1);
}
