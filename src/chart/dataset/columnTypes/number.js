/* eslint no-irregular-whitespace: "off" */

import _each from 'underscore-es/each';
import _isNumber from 'underscore-es/isNumber';
import _isUndefined from 'underscore-es/isUndefined';
import _isNull from 'underscore-es/isNull';
import equalish from '../../../shared/equalish';

/* globals Globalize */

/*
 * A type for numbers:
 *
 * Usage:
 * var parse = dw.type.number(sampleData);
 * parse()
 */
export default function(sample) {
    function signDigitsDecimalPlaces(num, sig) {
        if (num === 0) return 0;
        return Math.round(sig - Math.ceil(Math.log(Math.abs(num)) / Math.LN10));
    }

    let format;
    let errors = 0;
    const knownFormats = {
        '-.': /^ *[-–—−]?[0-9]*(\.[0-9]+)?(e[+-][0-9]+)?%? *$/,
        '-,': /^ *[-–—−]?[0-9]*(,[0-9]+)?%? *$/,
        ',.': /^ *[-–—−]?[0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?%? *$/,
        '.,': /^ *[-–—−]?[0-9]{1,3}(\.[0-9]{3})*(,[0-9]+)?%? *$/,
        ' .': /^ *[-–—−]?[0-9]{1,3}( [0-9]{3})*(\.[0-9]+)?%? *$/,
        ' ,': /^ *[-–—−]?[0-9]{1,3}( [0-9]{3})*(,[0-9]+)?%? *$/,
        // thin spaces
        ' .': /^ *[-–—−]?[0-9]{1,3}( [0-9]{3})*(\.[0-9]+)?%? *$/,
        ' ,': /^ *[-–—−]?[0-9]{1,3}( [0-9]{3})*(,[0-9]+)?%? *$/,
        // excel sometimes produces a strange white-space:
        ' .': /^ *[-–—−]?[0-9]{1,3}( [0-9]{3})*(\.[0-9]+)?%? *$/,
        ' ,': /^ *[-–—−]?[0-9]{1,3}( [0-9]{3})*(,[0-9]+)?%? *$/,
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

    _each(sample, function(n) {
        _each(knownFormats, function(regex, fmt) {
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
            if (_isNumber(raw) || _isUndefined(raw) || _isNull(raw)) return raw;
            // replace percent sign, n-dash & m-dash
            var number = raw
                .replace('%', '')
                .replace('−', '-')
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

        // returns a function for formatting numbers
        formatter: function(config) {
            let format = config['number-format'] || '-';
            let div = Number(config['number-divisor'] || 0);
            let append = (config['number-append'] || '').replace(/ /g, '\u00A0');
            let prepend = (config['number-prepend'] || '').replace(/ /g, '\u00A0');
            return function(val, full, round) {
                if (isNaN(val)) return val;
                var _fmt = format;
                if (div !== 0 && _fmt === '-') _fmt = 'n1';
                if (div !== 0) val = Number(val) / Math.pow(10, div);
                if (_fmt.substr(0, 1) === 's') {
                    // significant figures
                    var sig = +_fmt.substr(1);
                    _fmt = 'n' + Math.max(0, signDigitsDecimalPlaces(val, sig));
                }
                if (round) _fmt = 'n0';
                if (_fmt === '-') {
                    // guess number format based on single number
                    _fmt = equalish(val, Math.round(val))
                        ? 'n0'
                        : equalish(val, Math.round(val * 10) * 0.1)
                        ? 'n1'
                        : equalish(val, Math.round(val * 100) * 0.01)
                        ? 'n2'
                        : equalish(val, Math.round(val * 1000) * 0.001)
                        ? 'n3'
                        : equalish(val, Math.round(val * 10000) * 0.0001)
                        ? 'n4'
                        : equalish(val, Math.round(val * 100000) * 0.00001)
                        ? 'n5'
                        : 'n6';
                }
                val = Globalize.format(val, _fmt !== '-' ? _fmt : null);
                return full ? prepend + val + append : val;
            };
        },

        isValid: function(val) {
            return val === '' || naStrings[String(val).toLowerCase()] || _isNumber(type.parse(val));
        },

        ambiguousFormats: function() {
            var candidates = [];
            _each(matches, function(cnt, fmt) {
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
