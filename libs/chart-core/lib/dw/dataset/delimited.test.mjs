/* eslint-env node */
import test from 'ava';
import delimited from './delimited.mjs';
import fetch from 'node-fetch';

test('simple tsv', async t => {
    const csv = `Party\tWomen\tMen\tTotal
CDU/CSU\t45\t192\t237
SPD\t57\t89\t146
FDP\t24\t69\t93
LINKE\t42\t34\t76
GRÜNE\t36\t32\t68
`;
    const dataset = await delimited({ csv }).dataset();
    // column count
    t.is(dataset.numColumns(), 4);
    // row count
    t.is(dataset.numRows(), 5);
    // column types
    t.deepEqual(
        dataset.columns().map(c => c.type()),
        ['text', 'number', 'number', 'number']
    );
});

test('simple tsv when firstRowIsHeader is false', async t => {
    const csv = `Party\tWomen\tMen\tTotal
CDU/CSU\t45\t192\t237
SPD\t57\t89\t146
FDP\t24\t69\t93
LINKE\t42\t34\t76
GRÜNE\t36\t32\t68
`;
    const dataset = await delimited({ csv, firstRowIsHeader: false }).dataset();
    // column count
    t.is(dataset.numColumns(), 4);
    // row count
    t.is(dataset.numRows(), 6);
    // column types
    t.deepEqual(
        dataset.columns().map(c => c.type()),
        ['text', 'text', 'text', 'text']
    );
    // column names
    t.deepEqual(
        dataset.columns().map(c => c.name()),
        ['X.1', 'X.2', 'X.3', 'X.4']
    );
});

test('simple tsv with empty columns and columns with conflicting names', async t => {
    const csv = `foo\tfoo\t\t
CDU/CSU\t45\t192\t237
SPD\t57\t89\t146
FDP\t24\t69\t93
LINKE\t42\t34\t76
GRÜNE\t36\t32\t68
`;
    const dataset = await delimited({ csv }).dataset();
    t.deepEqual(
        dataset.columns().map(c => c.name()),
        ['foo', 'foo1', 'X.1', 'X.2']
    );
});

test('nasty tsv with new lines in quoted values', async t => {
    const csv = `Party\t"Women\n\tfoo"\t""Men""\t"Total"
"CDU/CSU"\t45\t192\t237
"SPD"\t57\t89\t146
"FDP"\t24\t69\t93
"LINKE"\t42\t34\t76
"GRÜNE"\t36\t32\t68
`;
    const dataset = await delimited({ csv }).dataset();
    // column count
    t.is(dataset.numColumns(), 4);
    // row count
    t.is(dataset.numRows(), 5);
    // column types
    t.deepEqual(
        dataset.columns().map(c => c.type()),
        ['text', 'number', 'number', 'number']
    );
});

test('german csv with quoted html umlauts', async t => {
    const csv = `Landkreis;SPD ;CDU;"Gr&uuml;ne";Die Linke;AfD;FDP;Sonstige
Elbe-Elster;32;16,8;14,9;23,2;2,6;4,8;5,7
Havelland;30,7;22,2;15,3;17,6;5,6;5,3;3,3
"M&auml;rkisch-Oderland";28,6;19,9;23,2;17,5;5,1;3,9;1,8
Oberhavel;29,1;20,2;15,1;18,7;7,5;5;4,4
Prignitz;25,9;26,6;16,5;17,1;7,4;3,7;2,8
"Spree-Nei&szlig;e";30,3;16,5;14,1;26,9;2,7;5,5;4
Uckermark;32,8;20,5;17,3;20,1;2,8;3,4;3,1
`;
    const dataset = await delimited({ csv }).dataset();
    // column count
    t.is(dataset.numColumns(), 8);
    // row count
    t.is(dataset.numRows(), 7);
    // column types
    t.deepEqual(
        dataset.columns().map(c => c.type()),
        ['text', 'number', 'number', 'number', 'number', 'number', 'number', 'number']
    );
});

test('german debt dataset, transposed', async t => {
    const csv = `"","2007","2008","2009","2010","2011","2012","2013","2014","2015","2016"
"New debt in Bio.","14,3","11,5","34,1","44","17,3","34,8","19,6","14,6","10,3","1,1"
`;
    const dataset = await delimited({ csv, transpose: true }).dataset();
    // column count
    t.is(dataset.numColumns(), 2);
    // row count
    t.is(dataset.numRows(), 10);
    t.is(dataset.column(1).val(0), 14.3);
    // column types
    t.deepEqual(
        dataset.columns().map(c => c.type()),
        ['date', 'number']
    );
});

test('another one', async t => {
    const csv = `ags\tlabel\tshort\tohne.2013.proz
1001\tFlensburg, Kreisfreie Stadt\tFlensburg\t0.076
1002\tKiel, Landeshauptstadt, Kreisfreie Stadt\tKiel\t0.077
1003\tLübeck, Hansestadt, Kreisfreie Stadt\tLübeck\t0.086
1004\tNeumünster, Kreisfreie Stadt\tNeumünster\t0.088
1051\tDithmarschen, Landkreis\tDithmarschen\t0.086
1053\tHerzogtum Lauenburg, Landkreis\tHerzogtum Lauenburg 0.086
1054\tNordfriesland, Landkreis\tNordfriesland\t0.072
1055\tOstholstein, Landkreis\tOstholstein 0.087
1056\tPinneberg, Landkreis\tPinneberg\t0.065
1057\tPlön, Landkreis\tPlön\t0.081
1058\tRendsburg-Eckernförde, Landkreis\tRendsburg-Eckernförde\t0.081`;
    const dataset = await delimited({ csv }).dataset();
    // column count
    t.is(dataset.numColumns(), 4);
    // row count
    t.is(dataset.numRows(), 11);
    // column types
    t.deepEqual(
        dataset.columns().map(c => c.type()),
        ['number', 'text', 'text', 'number']
    );
});

test('everything is quoted', async t => {
    const csv = `"Bezirk","Anzahl","Mittelwert Miete Euro pro qm"
"Charlottenburg-Wilmersdorf","609.0","17.573844996618483"
"Friedrichshain-Kreuzberg","366.0","18.732384651551758"`;
    const dataset = await delimited({ csv }).dataset();
    // column count
    t.is(dataset.column(0).name(), 'Bezirk');
});

test('dataset with empty quotes', async t => {
    const csv = `Year\tValue\tColumn2\tColumn3
2011\t10\t15\t
2012\t16\t13\t""
2013\t15\t18\t
2014\t15\t18\t10
2015\t1000\t20\t10
2016\t16\t""\t10
2017\t12\t\t
2018\t20\t\t
2019\t10\t\t`;
    const dataset = await delimited({ csv }).dataset();
    // column count
    t.is(dataset.column(0).name(), 'Year');
    t.is(dataset.numColumns(), 4);
    t.is(dataset.numRows(), 9);
    t.deepEqual(dataset.column(2).values(), [15, 13, 18, 18, 20, null, null, null, null]);
    t.deepEqual(dataset.column(3).values(), [null, null, null, 10, 10, 10, null, null, null]);
});

test('load dataset from url', async t => {
    global.window = { fetch };
    const url = 'https://static.dwcdn.net/data-feed/coronavirus/germany-symbolmap-per-state.csv';
    const dataset = await delimited({ url }).dataset();
    t.is(dataset.numColumns(), 10);
});

test('empty csv is parsed as a dataset with one column and no rows', async t => {
    const csv = `
`;
    const dataset = await delimited({ csv }).dataset();
    t.is(dataset.numColumns(), 1);
    t.is(dataset.numRows(), 0);
    t.is(dataset.column(0).name(), 'X.1');
});

test('csv with only header is parsed as a dataset with several columns and no rows', async t => {
    const csv = `Party\tWomen\tMen\tTotal
`;
    const dataset = await delimited({ csv }).dataset();
    t.is(dataset.numColumns(), 4);
    t.is(dataset.numRows(), 0);
});

test('skipRows processes the csv starting from passed row index', async t => {
    const csv = `Party\tWomen\tMen\tTotal
CDU/CSU\t45\t192\t237
SPD\t57\t89\t146
FDP\t24\t69\t93
LINKE\t42\t34\t76
GRÜNE\t36\t32\t68
`;
    const dataset = await delimited({ csv, skipRows: 2 }).dataset();
    t.deepEqual(dataset.column(0).raw(), ['FDP', 'LINKE', 'GRÜNE']);
    t.deepEqual(dataset.column(1).raw(), ['24', '42', '36']);
});

test('skipRows larger than the number of csv rows produces an empty dataset', async t => {
    const csv = `Party\tWomen\tMen\tTotal
CDU/CSU\t45\t192\t237
SPD\t57\t89\t146
FDP\t24\t69\t93
LINKE\t42\t34\t76
GRÜNE\t36\t32\t68
`;
    const dataset = await delimited({ csv, skipRows: 99 }).dataset();
    t.is(dataset.numColumns(), 0);
});
