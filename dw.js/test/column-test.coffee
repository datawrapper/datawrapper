
_ = require 'underscore'
root.Globalize = require 'globalize'
vows = require 'vows'
assert = require 'assert'
dw = require '../dw-2.0.js'


sample_data = ['-13363', '40212', '2000', '3819', '45181', '4018', '38681', '31552', '', '38479', '-24131', '-48902', '28567', '743', '28324', '26446', '35948', '-43687', '49140', '17597', '23847', '12167', '24885', '31393', '16453', '-42788', '21017', '4647', '10721', '11091', '27875', '-13968', '42165', '487', '-11276', '25426', '-34332', '-33182', '-23273', '4333', '13135', '2753', '41574', '31647', '-47673', '25742', '4758', '-31039', '-14942', '-37304']


vows
    .describe('Some basic tests for column API')
    .addBatch

        'column range':
            'topic': dw.column('', [1,2,3,4,5,6,7])
            'range': (topic) -> assert.deepEqual topic.range(), [1, 7]

        'column range with NaN':
            'topic': dw.column('', [1,2,3,4,Number.NaN,6,7])
            'range': (topic) -> assert.deepEqual topic.range(), [1, 7]

        'column range with empty string':
            'topic': dw.column('', ['1','2','3','4','','6','7'])
            'range': (topic) -> assert.deepEqual topic.range(), [1, 7]

        'column range with null':
            'topic': dw.column('', ['1','2','3','4',null,'6','7'])
            'range': (topic) -> assert.deepEqual topic.range(), [1, 7]

        'column range with undefined':
            'topic': dw.column('', ['1','2','3','4',undefined,'6','7'])
            'range': (topic) -> assert.deepEqual topic.range(), [1, 7]

        'check date range':
            'topic': dw.column('', [new Date(1990, 0, 1), new Date(1990, 6, 1), new Date(1991, 11, 1)])
            'range': (topic) -> assert.deepEqual topic.range(), [new Date(1990, 0, 1), new Date(1991, 11, 1)]

        'override auto-detected column type':
            'topic': dw.column('', sample_data)
            'auto-detected type is number': (topic) ->
                assert.equal topic.type(), 'number'
            'parsed value is of type Number': (topic) ->
                assert.equal typeof topic.val(0), 'number'
            'setting type to text, returns column': (topic) ->
                assert.equal topic.type('text'), topic
            'new type is text': (topic) ->
                assert.equal topic.type(), 'text'
            'parsed values is of type string now': (topic) ->
                assert.equal typeof topic.val(0), 'string'
            'setting type to date': (topic) ->
                assert.equal topic.type('date'), topic
            'new type is date': (topic) ->
                assert.equal topic.type(), 'date'
            'parsed invalid value is of type string (raw)': (topic) ->
                assert.equal typeof topic.val(0), 'string'
            'parsed valid value is a Date': (topic) ->
                assert _.isDate(topic.val(2))

        'force column type date':
            'topic': dw.column('', ['1365','1458','1235','1382','1443','1581','1334','1794','3757','1801'])
            'auto-detected as numbers': (column) ->
                assert.equal column.type(), 'number'
            'hard-set type to date': (column) ->
                column.type('date')
                assert.equal column.type(), 'date'
            'values parsed as dates': (column) ->
                assert.deepEqual column.val(0), new Date(1365, 0, 1)

        'API':
            'topic': dw.column('', sample_data)
            'column.raw': (topic) -> assert.deepEqual topic.raw(), sample_data
            'column.values': (topic) -> assert.equal topic.values().length, sample_data.length
            'column.indexOf': (topic) -> assert.equal topic.indexOf(45181), 4


    .export module
