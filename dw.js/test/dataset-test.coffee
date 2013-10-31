
root._ = require 'underscore'
root.Globalize = require 'globalize'
vows = require 'vows'
assert = require 'assert'
dw = require '../dw-2.0.js'


columns = [
    dw.column('Party', ['CDU/CSU', 'SPD', 'FDP', 'LINKE', 'GRÜNE']),
    dw.column('Women', [45, 57, 24, 42, 36]),
    dw.column('Men', [192, 89, 69, 34, 32]),
    dw.column('Total', [237, 146, 93, 76, 68]),
];

vows
    .describe('Some basic tests for column API')
    .addBatch

        'test dw.dataset api':
            'topic': dw.dataset(columns)

            'columns': (topic) -> assert.deepEqual topic.columns(), columns
            'numColumns': (topic) -> assert.equal topic.numColumns(), 4
            'numRows': (topic) -> assert.equal topic.numRows(), 5

            'getting column by index': (topic) -> assert.deepEqual topic.column(0), columns[0]
            'getting column by name': (topic) -> assert.deepEqual topic.column('Women'), columns[1]
            'getting unknown column': (topic) -> assert.throws () -> topic.column('Foo')

            'checking existing column': (topic) -> assert topic.hasColumn('Men')
            'checking non-existing column': (topic) -> assert.isFalse topic.hasColumn('Foo')

            'exporting as csv': (topic) -> assert.equal topic.toCSV(), "Party,Women,Men,Total\nCDU/CSU,45,192,237\nSPD,57,89,146\nFDP,24,69,93\nLINKE,42,34,76\nGRÜNE,36,32,68"

            'filtering columns': (topic) -> assert.equal topic.filterColumns({ Men: true }), topic
            'column was removed': (topic) -> assert.isFalse topic.hasColumn 'Men'

            'indexOf': (topic) -> assert.equal topic.indexOf('Women'), 1

            'add column': (topic) -> assert.equal topic.add(dw.column('Foo', _.range(5))), topic
            'check new column': (topic) -> assert topic.hasColumn 'Foo'
            'reset dataset': (topic) -> assert.equal topic.reset(), topic
            'removed column is back': (topic) -> assert topic.hasColumn 'Men'
            'added column is gone': (topic) -> assert.isFalse topic.hasColumn 'Foo'

    .export module
