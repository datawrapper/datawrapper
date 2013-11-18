
root._ = require 'underscore'
root.Globalize = require 'globalize'
vows = require 'vows'
assert = require 'assert'

dw = require '../dw-2.0.js'

test_data = []

test_data.push ['5.4', 5.4, 4.2, 4, 3.6, 3.4]
test_data.push ['33k', 33030, 27540]
test_data.push ['33,030', 33030, 33100]
test_data.push ['5', 5, 7, 9, 10, 13]
test_data.push ['50', 50, 70, 90, 100, 130]
test_data.push ['500', 500, 700, 900, 1000, 1300]
test_data.push ['5k', 5000, 7000, 9000, 10000, 13000]
test_data.push ['50k', 50000, 70000, 90000, 100000, 130000]
test_data.push ['0.5M', 500000, 700000, 900000, 1000000, 1300000]
test_data.push ['510k', 510000, 540000, 900000, 1000000, 1300000]
test_data.push ['1', 1, 2, 3, 4, 5]
test_data.push ['0.1', 0.1, 0.2, 0.3, 0.4, 0.5]
test_data.push ['0.01', 0.01, 0.02, 0.03, 0.04, 0.05]
test_data.push ['1 × 10<sup>-3</sup>', 0.001, 0.002, 0.003, 0.004, 0.005]
test_data.push ['1 × 10<sup>-4</sup>', 0.00011, 0.0002, 0.0003, 0.0004, 0.0005]
test_data.push ['11 × 10<sup>-5</sup>', 0.00011, 0.00013, 0.0003, 0.0004, 0.0005]

i = 0
batch = {}

add_test = (key, t) ->
    batch[key] =
        'topic': () ->
            chart = dw.chart({})
            chart.locale 'en-US'
            ds = dw.dataset [dw.column('numbers', t.slice(1))]
            chart.dataset ds
            chart

        'check format': (chart) ->
            ds = chart.dataset()
            col = ds.column(0)
            fmt = chart.columnFormatter(ds.column(0))
            assert.equal fmt(col.val(0), true), t[0]



for t in test_data
    key = 'testing auto-format #'+(i++)
    add_test key, t

# vows
#     .describe('Testing number column auto-formatting')
#     .addBatch(batch)
#     .export module
