/* eslint no-irregular-whitespace: "off" */

import { each, isNumber, isUndefined, isNull } from 'underscore';

/*
 * A type for numbers:
 *
 * Usage:
 * var parse = dw.type.number(sampleData);
 * parse()
 */
export default function(sample) {
    let format;
    let errors = 0;
    const knownFormats = {
        '-.': /^ *[-–—−]?[0-9]*(\.[0-9]+)?(e[+-][0-9]+)?%? *$/,
        '-,': /^ *[-–—−]?[0-9]*(,[0-9]+)?%? *$/,
        ',.': /^ *[-–—−]?[0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?%? *$/,
        '.,': /^ *[-–—−]?[0-9]{1,3}(\.[0-9]{3})*(,[0-9]+)?%? *$/,
        ' .': /^ *[-–—−]?[0-9]{1,3}([   ][0-9]{3})*(\.[0-9]+)?%? *$/,
        ' ,': /^ *[-–—−]?[0-9]{1,3}([   ][0-9]{3})*(,[0-9]+)?%? *$/,
        // excel sometimes produces a strange white-space:
        "'.": /^ *[-–—−]?[0-9]{1,3}('[0-9]{3})*(\.[0-9]+)?%? *$/
    };
    const formatLabels = {
        '-.': '1234.56',
        '-,': '1234,56',
        ',.': '1,234.56',
        '.,': '1.234,56',
        ' .': '1 234.56',
        ' ,': '1 234,56',
        // excel sometimes produces a strange white-space:
        ' .': '1 234.56',
        ' ,': '1 234,56',
        ' .': '1 234.56',
        ' ,': '1 234,56'
    };
    // a list of strings that are recognized as 'not available'
    const naStrings = {
        na: 1,
        'n/a': 1,
        '-': 1,
        ':': 1
    };

    const matches = {};
    const bestMatch = ['-.', 0];

    sample = sample || [];

    each(sample, function(n) {
        each(knownFormats, function(regex, fmt) {
            if (matches[fmt] === undefined) matches[fmt] = 0;
            if (regex.test(n)) {
                matches[fmt] += 1;
                if (matches[fmt] > bestMatch[1]) {
                    bestMatch[0] = fmt;
                    bestMatch[1] = matches[fmt];
                }
            }
        });
    });
    format = bestMatch[0];

    // public interface
    var type = {
        parse: function(raw) {
            if (isNumber(raw) || isUndefined(raw) || isNull(raw)) return raw;
            // replace percent sign, n-dash & m-dash, remove weird spaces
            var number = raw
                .replace('%', '')
                .replace('−', '-')
                .replace(/[   ]/g, '')
                .replace('–', '-')
                .replace('—', '-');
            // normalize number
            if (format[0] !== '-') {
                // remove kilo seperator
                number = number.replace(new RegExp(format[0] === '.' ? '\\.' : format[0], 'g'), '');
            }
            if (format[1] !== '.') {
                // replace decimal char w/ point
                number = number.replace(format[1], '.');
            }
            if (isNaN(number) || number === '') {
                if (!naStrings[number.toLowerCase()] && number !== '') errors++;
                return raw;
            }
            return Number(number);
        },
        toNum: function(i) {
            return i;
        },
        fromNum: function(i) {
            return i;
        },
        errors: function() {
            return errors;
        },
        name: function() {
            return 'number';
        },

        isValid: function(val) {
            return val === '' || naStrings[String(val).toLowerCase()] || isNumber(type.parse(val));
        },

        ambiguousFormats: function() {
            var candidates = [];
            each(matches, function(cnt, fmt) {
                if (cnt === bestMatch[1]) {
                    candidates.push([fmt, formatLabels[fmt]]); // key, label
                }
            });
            return candidates;
        },

        format: function(fmt) {
            if (arguments.length) {
                format = fmt;
                return type;
            }
            return format;
        }
    };
    return type;
}
