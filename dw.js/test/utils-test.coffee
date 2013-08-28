
_ = require 'underscore'
vows = require 'vows'
assert = require 'assert'

dw = require '../dw-2.0.js'


vows
    .describe('Some basic tests for dw.utils')
    .addBatch

        'check utils.purifyHtml':
            'topic': dw.utils.purifyHtml('Evil<script>alert("foo")</script> data')
            'removed script': (topic) -> assert.equal topic, 'Evil data'
