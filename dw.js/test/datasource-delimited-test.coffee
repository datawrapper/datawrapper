
global._ = require 'underscore'
JSDOM = require('jsdom').JSDOM
dom = new JSDOM '<html></html>'
global.$ = require("jquery") dom.window
# root.$ = require 'jquery'
global.Globalize = require 'globalize'
vows = require 'vows'
assert = require 'assert'

dw = require '../dw-2.0.js'

_types = (c) -> c.type()


vows
    .describe('Reading different CSV datasets')

    .addBatch

        'The tsv "women-in-parliament"':
            topic: dw.datasource.delimited
                csv: 'Party\tWomen\tMen\tTotal\nCDU/CSU\t45\t192\t237\nSPD\t57\t89\t146\nFDP\t24\t69\t93\nLINKE\t42\t34\t76\nGRÜNE\t36\t32\t68\n'

            'when loaded as dataset':
                topic: (src) ->
                    src.dataset().done @callback
                    return

                'has four columns': (dataset, f) ->
                    assert.equal dataset.numColumns(), 4

                'has five rows': (dataset, f) ->
                    assert.equal dataset.numRows(), 5

                'has correct column types': (dataset, f) ->
                    assert.deepEqual _.map(dataset.columns(), _types), ['text', 'number', 'number', 'number']

        'A nasty tsv with new lines in quoted values':
            topic: dw.datasource.delimited
                csv: 'Party\t"Women\n\tfoo"\t"\"Men\""\t"Total"\n"CDU/CSU"\t45\t192\t237\n"SPD"\t57\t89\t146\n"FDP"\t24\t69\t93\n"LINKE"\t42\t34\t76\n"GRÜNE"\t36\t32\t68\n'

            'when loaded as dataset':
                topic: (src) ->
                    src.dataset().done @callback
                    return

                'has four columns': (dataset, f) ->
                    assert.equal dataset.numColumns(), 4

                'has five rows': (dataset, f) ->
                    assert.equal dataset.numRows(), 5

                'has correct column types': (dataset, f) ->
                    assert.deepEqual _.map(dataset.columns(), _types), ['text', 'number', 'number', 'number']


        'The csv "german-debt"':
            topic: dw.datasource.delimited
                transpose: true
                csv: '"","2007","2008","2009","2010","2011","2012","2013","2014","2015","2016"\n"New debt in Bio.","14,3","11,5","34,1","44","17,3","34,8","19,6","14,6","10,3","1,1"\n'

            'when loaded as dataset':
                topic: (src) ->
                    src.dataset().done @callback
                    return

                'has two columns': (dataset, f) ->
                    assert.equal dataset.numColumns(), 2

                'has ten rows': (dataset, f) ->
                    assert.equal dataset.numRows(), 10

                'has correct column types': (dataset, f) ->
                    assert.deepEqual _.map(dataset.columns(), _types), ['date', 'number']

                'was correctly parsed': (dataset, f) ->
                    assert.equal dataset.column(1).val(0), 14.3

        'Another one':
            topic: dw.datasource.delimited
                csv: "ags\tlabel\tshort\tohne.2013.proz\n1001\tFlensburg, Kreisfreie Stadt\tFlensburg\t0.076\n1002\tKiel, Landeshauptstadt, Kreisfreie Stadt\tKiel\t0.077\n1003\tLübeck, Hansestadt, Kreisfreie Stadt\tLübeck\t0.086\n1004\tNeumünster, Kreisfreie Stadt\tNeumünster\t0.088\n1051\tDithmarschen, Landkreis\tDithmarschen\t0.086\n1053\tHerzogtum Lauenburg, Landkreis\tHerzogtum Lauenburg 0.086\n1054\tNordfriesland, Landkreis\tNordfriesland\t0.072\n1055\tOstholstein, Landkreis\tOstholstein 0.087\n1056\tPinneberg, Landkreis\tPinneberg\t0.065\n1057\tPlön, Landkreis\tPlön\t0.081\n1058\tRendsburg-Eckernförde, Landkreis\tRendsburg-Eckernförde\t0.081"

            'when loaded as dataset':
                topic: (src) ->
                    src.dataset().done @callback
                    return

                'has four columns': (dataset, f) ->
                    assert.equal dataset.numColumns(), 4

                'has five rows': (dataset, f) ->
                    assert.equal dataset.numRows(), 11

                'has correct column types': (dataset, f) ->
                    assert.deepEqual _.map(dataset.columns(), _types), ['number', 'text', 'text', 'number']

        'everything is quoted':
            topic: dw.datasource.delimited
                csv: '"Bezirk","Anzahl","Mittelwert Miete Euro pro qm"\n"Charlottenburg-Wilmersdorf","609.0","17.573844996618483"\n"Friedrichshain-Kreuzberg","366.0","18.732384651551758"'

            'when loaded as dataset':
                topic: (src) ->
                    src.dataset().done @callback
                    return

                'the first column name is correct': (dataset, f) ->
                    assert.equal 'Bezirk', dataset.column(0).name()

        'A tsv full of undefined & empty values':
            topic: dw.datasource.delimited
                csv: 'Year\tValue\tColumn2\tColumn3\n2011\t10\t15\t\n2012\t16\t13\t""\n2013\t15\t18\t\n2014\t15\t18\t10\n2015\t1000\t20\t10\n2016\t16\t""\t10\n2017\t12\t\t\n2018\t20\t\t\n2019\t10\t\t'

            'when loaded as dataset':
                topic: (src) ->
                    src.dataset().done @callback
                    return

                'the column types are correct': (dataset, f) ->
                    assert.equal 'date', dataset.column(0).type()
                    assert.equal 'number', dataset.column(1).type()
                    assert.equal 'number', dataset.column(2).type()
                    assert.equal 'number', dataset.column(3).type()

                'empty values are null': (dataset, f) ->
                    assert.deepStrictEqual dataset.column(2).values(), [15,13,18,18,20,null,null,null,null]
                    assert.deepStrictEqual dataset.column(3).values(), [null,null,null,10,10,10,null,null,null]


    .export module