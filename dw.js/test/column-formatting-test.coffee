
root._ = require 'underscore'
root.Globalize = require 'globalize'
vows = require 'vows'
assert = require 'assert'
dw = require '../dw-2.0.js'

test_data = [5.4, 4.2, 4, 3.6, 3.4]

vows
    .describe('Testing column formatting')
    .addBatch

        'number column formatting':

            'topic': dw.column('', test_data)

            'no decimals': (col) ->
                fmt = col.type(true).formatter({ 'number-format': 'n0' })
                formatted = []
                for v in col.values()
                    formatted.push fmt(v)
                assert.deepEqual formatted, ['5', '4', '4', '4', '3']

            'one decimal': (col) ->
                fmt = col.type(true).formatter({ 'number-format': 'n1' })
                formatted = []
                Globalize.culture('en-US')
                for v in col.values()
                    formatted.push fmt(v)
                assert.deepEqual formatted, ['5.4', '4.2', '4.0', '3.6', '3.4']

    .export module
