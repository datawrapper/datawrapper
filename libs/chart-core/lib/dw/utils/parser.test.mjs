/*
 * test our own custom methods and operators for `expr-eval`
 */
import test from 'ava';
import { Parser } from './parser.mjs';

const parser = new Parser();

test('in operator', t => {
    const expr = parser.parse('needle in haystack ? "y" : "n"');
    t.is(expr.evaluate({ needle: 'foo', haystack: 'lot of foo here' }), 'y');
    t.is(expr.evaluate({ needle: 'bar', haystack: 'lot of foo here' }), 'n');
});

test('!operator', t => {
    const expr = parser.parse('!(needle in haystack) ? "y" : "n"');
    t.is(expr.evaluate({ needle: 'foo', haystack: 'lot of foo here' }), 'n');
    t.is(expr.evaluate({ needle: 'bar', haystack: 'lot of foo here' }), 'y');
});

test('not function', t => {
    const expr = parser.parse('NOT(needle in haystack) ? "y" : "n"');
    t.is(expr.evaluate({ needle: 'foo', haystack: 'lot of foo here' }), 'n');
    t.is(expr.evaluate({ needle: 'bar', haystack: 'lot of foo here' }), 'y');
});

test('substr function', t => {
    const expr = parser.parse('SUBSTR(name, 0, 5)');
    t.is(expr.evaluate({ name: 'Datawrapper' }), 'Dataw');
});

test('variable substr', t => {
    const expr = parser.parse('SUBSTR(name, start, len)');
    t.is(expr.evaluate({ name: 'Datawrapper', start: 0, len: 6 }), 'Datawr');
    t.is(expr.evaluate({ name: 'Datawrapper', start: 3, len: 6 }), 'awrapp');
});

test('concat function', t => {
    const expr = parser.parse('CONCAT(first, " ", last)');
    t.is(expr.evaluate({ first: 'Lorem', last: 'Ipsum' }), 'Lorem Ipsum');
});

test('trim function', t => {
    const expr = parser.parse('TRIM(name)');
    t.is(expr.evaluate({ name: '  spaces\t\t' }), 'spaces');
    t.is(parser.evaluate('TRIM "  hello  "'), 'hello');
});

test('trim function without brackets', t => {
    const expr = parser.parse('TRIM name');
    t.is(expr.evaluate({ name: '  spaces\t\t' }), 'spaces');
});

test('TRUE', t => {
    const expr = parser.parse('TRUE');
    t.is(expr.evaluate({ name: '' }), true);
});

test('NOT TRUE', t => {
    const expr = parser.parse('NOT TRUE');
    t.is(expr.evaluate({ name: '' }), false);
});

test('IF(TRUE', t => {
    const expr = parser.parse('IF(TRUE, "yes", "no")');
    t.is(expr.evaluate({ name: '' }), 'yes');
});

test('FALSE', t => {
    const expr = parser.parse('FALSE');
    t.is(expr.evaluate({ name: '' }), false);
});

test('TRUE and FALSE', t => {
    const expr = parser.parse('TRUE and FALSE');
    t.is(expr.evaluate({ name: '' }), false);
});

test('true', t => {
    const expr = parser.parse('true');
    t.is(expr.evaluate({ true: 12 }), 12);
    t.throws(() => expr.evaluate({ foo: 12 }));
});

test('ABS()', t => {
    const expr = parser.parse('ABS(a)');
    t.is(expr.evaluate({ a: -12 }), 12);
    t.is(expr.evaluate({ a: 10 }), 10);
});

test('ABS', t => {
    const expr = parser.parse('ABS a');
    t.is(expr.evaluate({ a: -12 }), 12);
    t.is(expr.evaluate({ a: 10 }), 10);
});

test('ROUND()', t => {
    const expr = parser.parse('ROUND(a)');
    t.is(expr.evaluate({ a: -12.345 }), -12);
    t.is(expr.evaluate({ a: 10.56 }), 11);
});

test('ROUND(a,1)', t => {
    const expr = parser.parse('ROUND(a, 1)');
    t.is(expr.evaluate({ a: -12.345 }), -12.3);
    t.is(expr.evaluate({ a: 10.56 }), 10.6);
});

test('year() function', t => {
    const expr = parser.parse('YEAR(date)');
    t.is(expr.evaluate({ date: new Date(2020, 1, 1) }), 2020);
    t.is(expr.evaluate({ date: new Date(2017, 4, 14) }), 2017);
    t.is(expr.evaluate({ date: '2017-06-23' }), 2017);
});

test('month() function', t => {
    const expr = parser.parse('MONTH(date)');
    t.is(expr.evaluate({ date: new Date(2020, 1, 1) }), 2);
    t.is(expr.evaluate({ date: new Date(2017, 4, 14) }), 5);
});

test('day() function', t => {
    const expr = parser.parse('DAY(date)');
    t.is(expr.evaluate({ date: new Date(2020, 1, 1) }), 1);
    t.is(expr.evaluate({ date: new Date(2017, 4, 14) }), 14);
});

test('hours() function', t => {
    const expr = parser.parse('HOURS(date)');
    t.is(expr.evaluate({ date: new Date(2020, 1, 1) }), 0);
    t.is(expr.evaluate({ date: new Date(2017, 4, 14, 18, 30, 5) }), 18);
});

test('sin a^b', t => {
    const expr = parser.parse('SIN a^b');
    t.is(expr.evaluate({ a: 4, b: 2 }), Math.sin(Math.pow(4, 2)));
});

test('(sin a)^b', t => {
    const expr = parser.parse('(SIN a)^b');
    t.is(expr.evaluate({ a: 4, b: 2 }), Math.pow(Math.sin(4), 2));
});

test('sin(a)', t => {
    const expr = parser.parse('SIN(a)');
    t.is(expr.evaluate({ a: 4 }), Math.sin(4));
});

test('v1+v2+v3', t => {
    const expr = parser.parse('v1+v2+v3');
    t.is(expr.evaluate({ v1: 1, v2: 2, v3: 3 }), 6);
});

test('REPLACE()', t => {
    const expr = parser.parse('REPLACE(REPLACE(country, "Yemen", ":ye:"), "Zambia", ":zm:")');
    t.is(expr.evaluate({ country: 'Yemen' }), ':ye:');
    t.is(expr.evaluate({ country: 'Zambia' }), ':zm:');
    t.is(parser.evaluate('REPLACE("Hello world", "o", "a")'), 'Hella warld');
    t.is(parser.evaluate('REPLACE("Hello world", "o", f(d) = UPPER(d))'), 'HellO wOrld');
    t.is(parser.evaluate('REPLACE("Hello world", "o", UPPER)'), 'HellO wOrld');
    t.is(parser.evaluate('REPLACE("12.4", ".", ",")'), '12,4');
    t.is(parser.evaluate('REPLACE("12.4", "[0-9]", "x")'), '12.4');
    t.is(parser.evaluate('REPLACE_REGEX("12.4", "[0-9]", "x")'), 'xx.x');
    t.is(parser.evaluate('REPLACE_REGEX("12.4", "[0-9]+", "x")'), 'x.x');
    t.is(parser.evaluate('REPLACE_REGEX("12.4", "[0-9]", f(d) = d*2)'), '24.8');
});

test('ISNULL', t => {
    const expr = parser.parse('ISNULL value');
    t.is(expr.evaluate({ value: 12 }), false);
    t.is(expr.evaluate({ value: 0 }), false);
    t.throws(() => expr.evaluate({ value: undefined }));
    t.is(expr.evaluate({ value: null }), true);
});

test('FORMAT', t => {
    const expr = parser.parse('FORMAT(value, "0.00")');
    const FORMAT = (val, format) => {
        if (format === '0.00') return val.toFixed(2);
        return val.toFixed();
    };
    t.is(expr.evaluate({ value: 12, FORMAT }), '12.00');
});

test('ARRAY IN', t => {
    const expr = parser.parse('"are" in SPLIT(str, " ")');
    t.is(expr.evaluate({ str: 'charts are cool' }), true);
    t.is(expr.evaluate({ str: "charts aren't cool" }), false);
});

test('SPLIT', t => {
    const expr = parser.parse('(SPLIT(region, ", "))[0]');
    t.is(expr.evaluate({ region: 'Berlin, Germany' }), 'Berlin');
});

test('SPLIT + JOIN', t => {
    const expr = parser.parse('JOIN(SPLIT(region, ", "), " = ")');
    t.is(expr.evaluate({ region: 'Berlin, Germany' }), 'Berlin = Germany');
});

test('INDEXOF', t => {
    t.is(parser.evaluate('INDEXOF(text, "two")', { text: 'one,two,three' }), 4);
    t.is(parser.evaluate('INDEXOF(SPLIT(text, ","), "two")', { text: 'one,two,three' }), 1);
});

test('TEXT', t => {
    t.is(parser.evaluate('TEXT num', { num: 123456 }), '123456');
    t.is(parser.evaluate('TEXT(num)', { num: 123456 }), '123456');
});

test('NUMBER', t => {
    t.is(parser.evaluate('NUMBER str', { str: '123456' }), 123456);
    t.is(parser.evaluate('NUMBER(str)', { str: '123456' }), 123456);
});

test('NA', t => {
    t.is(parser.evaluate('NA'), Number.NaN);
    t.is(parser.evaluate('NULL'), Number.NaN);
});

test('DATE', t => {
    t.deepEqual(parser.evaluate('DATE()'), new Date());
    t.deepEqual(parser.evaluate('DATE(0)'), new Date(0));
    t.deepEqual(parser.evaluate('DATE(str)', { str: '2018/01/20' }), new Date('2018/01/20'));
    t.deepEqual(parser.evaluate('DATE(2020,5,6)'), new Date(2020, 4, 6));
});

test('WEEKDAY', t => {
    t.is(parser.evaluate('WEEKDAY(DATE(2020,5,10))'), 0);
    t.is(parser.evaluate('WEEKDAY(DATE(2020,5,11))'), 1);
    t.is(parser.evaluate('WEEKDAY(DATE(2020,5,12))'), 2);
});

test('DATEDIFF', t => {
    t.is(parser.evaluate('DATEDIFF("2020-05-01", "2020-05-02")'), 1);
    t.is(parser.evaluate('DATEDIFF("2020-05-05", "2020-05-02")'), -3);
});

test('TIMEDIFF', t => {
    t.is(parser.evaluate('TIMEDIFF("2020-05-01 10:00:00", "2020-05-01 10:00:05")'), 5);
    t.is(parser.evaluate('TIMEDIFF("2020-05-01 10:00:00", "2020-05-01 10:01:00")'), 60);
    t.is(parser.evaluate('TIMEDIFF("2020-05-01 10:00:00", "2020-05-01 12:00:00")'), 7200);
});

test('custom functions', t => {
    t.deepEqual(parser.evaluate('f(x) = x > 2; FILTER(f, [1, 2, 0, 3, -1, 5])'), [3, 5]);
    t.deepEqual(parser.evaluate('FILTER(f(x) = x > 2, [1, 2, 0, 3, -1, 5])'), [3, 5]);
});

const symbols = [
    {
        ID: 'USA',
        value: 1234
    },
    {
        ID: 'Canada',
        value: 876
    },
    {
        ID: 'Mexico',
        value: 7390
    }
];

test('PLUCK', t => {
    const ctx = { symbols };
    t.deepEqual(parser.evaluate('PLUCK(symbols, "value")', ctx), [1234, 876, 7390]);
    t.deepEqual(parser.evaluate('PLUCK(symbols, "ID")', ctx), ['USA', 'Canada', 'Mexico']);
    t.deepEqual(parser.evaluate('PLUCK(symbols, "constructor")', ctx), [null, null, null]);
});

test('PLUCK + JOIN', t => {
    const ctx = { symbols };
    t.deepEqual(
        parser.evaluate(`JOIN(PLUCK(symbols, 'ID'), ' and ')`, ctx),
        'USA and Canada and Mexico'
    );
    t.deepEqual(
        parser.evaluate(`JOIN(PLUCK(symbols, 'ID'), ', ', ' and ')`, ctx),
        'USA, Canada and Mexico'
    );
});

test('PLUCK + MAP + JOIN', t => {
    const ctx = { symbols };
    t.deepEqual(
        parser.evaluate(
            `JOIN(MAP(f(a) = CONCAT('<b>',a,'</b>'),PLUCK(symbols, 'ID')), ', ', ' and ')`,
            ctx
        ),
        '<b>USA</b>, <b>Canada</b> and <b>Mexico</b>'
    );
});

test('SORT', t => {
    const ctx = { symbols };
    t.is(parser.evaluate(`(SORT(symbols, FALSE, 'value'))[0].ID`, ctx), 'Mexico');
    t.is(parser.evaluate(`(SORT(symbols, TRUE, 'value'))[0].ID`, ctx), 'Canada');
    t.is(parser.evaluate(`(SORT(symbols, TRUE, f(d) = d.value))[0].ID`, ctx), 'Canada');
    t.is(parser.evaluate(`(PLUCK(SORT(symbols, TRUE, 'value'), 'ID'))[0]`, ctx), 'Canada');
});

test('Member-access', t => {
    const ctx = { symbols };
    t.is(parser.evaluate(`symbols[0].ID`, ctx), 'USA');
});

test('RANGE', t => {
    t.deepEqual(parser.evaluate(`RANGE(5)`), [0, 1, 2, 3, 4]);
    t.deepEqual(parser.evaluate(`MAP(f(x) = x*x, RANGE(5))`), [0, 1, 4, 9, 16]);
});

test('FOLD', t => {
    t.deepEqual(parser.evaluate(`FOLD(MAX, 0, [0,1,2,3,4,5])`), 5);
    t.deepEqual(parser.evaluate(`FOLD(MIN, 10, [0,1,2,3,4,5])`), 0);
    t.deepEqual(parser.evaluate(`FOLD(f(a,b) = a * b, 1, [1,2,3,4,5])`), 120);
});

test('UPPER, LOWER, PROPER, TITLE', t => {
    t.is(parser.evaluate(`UPPER("hellO worLd")`), 'HELLO WORLD');
    t.is(parser.evaluate(`LOWER("HellO WorLd")`), 'hello world');
    t.is(parser.evaluate(`PROPER("HellO WorLd")`), 'Hello World');
    t.is(parser.evaluate(`TITLE("HellO WorLd")`), 'Hello World');
    t.is(parser.evaluate(`TITLE("2-way street")`), '2-way Street');
    t.is(parser.evaluate(`PROPER("ämilian der schöpfer")`), 'Ämilian Der Schöpfer');
    t.is(parser.evaluate(`TITLE("ämilian der schöpfer")`), 'Ämilian Der Schöpfer');
    t.is(parser.evaluate(`PROPER("baron lloyd-webber")`), 'Baron Lloyd-Webber');
    t.is(parser.evaluate(`TITLE("baron lloyd-webber")`), 'Baron Lloyd-webber');
    t.is(parser.evaluate(`PROPER("2-way street")`), '2-Way Street');
    t.is(parser.evaluate(`PROPER("rgb2csv")`), 'Rgb2Csv');
    t.is(parser.evaluate(`TITLE("rgb2csv")`), 'Rgb2csv');
    t.is(parser.evaluate(`TITLE 'heLLo wORld'`), 'Hello World');
    t.is(parser.evaluate(`UPPER 'heLLo wORld'`), 'HELLO WORLD');
    t.is(parser.evaluate(`LOWER 'heLLo wORld'`), 'hello world');
    t.is(parser.evaluate(`PROPER 'heLLo wORld'`), 'Hello World');
});

test('SUM', t => {
    t.is(parser.evaluate(`SUM(1,2,3,4)`), 10);
    t.is(parser.evaluate(`SUM([1,2,3,4])`), 10);
    t.is(parser.evaluate(`SUM([1,2,3,4,"foo"])`), 10);
    t.is(parser.evaluate(`SUM([1,2,3,4,1/0])`), 10);
    t.is(parser.evaluate(`SUM([1,2,FALSE,3,4,1/0])`), 10);
});

test('MEAN', t => {
    t.is(parser.evaluate(`MEAN([1,2,3,4,10])`), 4);
    t.is(parser.evaluate(`MEAN(1,2,3,4,10)`), 4);
    t.is(parser.evaluate(`MEAN([1,2,3,4,"foo"])`), 2.5);
    t.is(parser.evaluate(`MEAN([1,2,3,4,1/0])`), 2.5);
});

test('MEDIAN', t => {
    t.is(parser.evaluate(`MEDIAN(1,2,3,4,10)`), 3);
    t.is(parser.evaluate(`MEDIAN([1,2,3,4,10])`), 3);
    t.is(parser.evaluate(`MEDIAN([1,2,3,4,"foo"])`), 2.5);
    t.is(parser.evaluate(`MEDIAN([1,2,3,4,1/0])`), 2.5);
});

test('MIN', t => {
    t.is(parser.evaluate(`MIN([1,2,3,4,10])`), 1);
    t.is(parser.evaluate(`MIN(2,3,4,10)`), 2);
    t.is(parser.evaluate(`MIN([1,2,-3,4,"foo"])`), -3);
    t.is(parser.evaluate(`MIN([1,2,3,4,1/0])`), 1);
});

test('MAX', t => {
    t.is(parser.evaluate(`MAX([1,2,3,4,10])`), 10);
    t.is(parser.evaluate(`MAX(-2,3,4,10)`), 10);
    t.is(parser.evaluate(`MAX([1,2,3,4,"foo"])`), 4);
    t.is(parser.evaluate(`MAX([1,2,3,4,1/0])`), 4);
});

test('SLICE', t => {
    t.deepEqual(parser.evaluate(`SLICE([1,2,3,4,5], 1)`), [2, 3, 4, 5]);
    t.deepEqual(parser.evaluate(`SLICE([1,2,3,4,5], 1,3)`), [2, 3]);
    t.deepEqual(parser.evaluate(`SLICE([1,2,3,4,5], -2)`), [4, 5]);
});

test('FIND', t => {
    t.is(parser.evaluate(`FIND([1,2,3,4,5], f(x) = x>2)`), 3);
});

test('EVERY', t => {
    t.is(parser.evaluate(`EVERY([1,2,3,4,5], f(x) = x>2)`), false);
    t.is(parser.evaluate(`EVERY([1,2,3,4,5], f(x) = x>0)`), true);
});

test('SOME', t => {
    t.is(parser.evaluate(`SOME([1,2,3,4,5], f(x) = x>2)`), true);
    t.is(parser.evaluate(`SOME([1,2,3,4,5], f(x) = x>0)`), true);
    t.is(parser.evaluate(`SOME([1,2,3,4,5], f(x) = x>10)`), false);
});
