
_ = require 'underscore'
vows = require 'vows'
assert = require 'assert'

dw = require '../dw-2.0.js'


checkSignDim = (values, dim) ->
    topic: values
    dim: (topic) ->
        assert.equal dw.utils.significantDimension(values), dim
    chk_uniq: (topic) ->
        dim = dw.utils.significantDimension(values)
        uniq = _.uniq topic, (v) -> dw.utils.round(v, dim)
        assert.equal uniq.length, topic.length

vows
    .describe('Some basic tests for dw.utils')
    .addBatch

        'check utils.purifyHtml':
            'topic': dw.utils.purifyHtml 'Evil<script>alert("foo")</script> data'
            'removed script': (topic) ->
                assert.equal topic, 'Evilalert("foo") data'

        'significantDimension #1': checkSignDim _.range(10), 0
        'significantDimension #2': checkSignDim _.range(0,100, 10), -1
        'significantDimension #3': checkSignDim _.range(0,1000, 100), -2
        'significantDimension #4': checkSignDim _.range(0,100, 1), 0
        'significantDimension #5': checkSignDim [9,10.57,12.14,13.71,15.28,16.85,18.42], 0
        'significantDimension #6': checkSignDim [9,10.57,12.14,12.31,15.28,16.85,18.42], 1
        'significantDimension #7': checkSignDim [9,10.57,12.14,12.134,15.28,16.85,18.42], 2


        'smartRound simple':
            'topic': [9,10.571428571428571,12.142857142857142,13.714285714285715,15.285714285714285,16.857142857142858,18.42857142857143]
            'check values': (topic) ->
                assert.deepEqual dw.utils.smartRound(topic), [9,11,12,14,15,17,18]
            'check values (prec +1)': (topic) ->
                assert.deepEqual dw.utils.smartRound(topic, 1), [9,10.6,12.1,13.7,15.3,16.9,18.4]

        'smartRound large numbers':
            'topic': [1567671, 2674349, 2681458, 3416274, 4721235, 6604073, 7253794, 8378838, 8432436, 8522286]
            'check values': (topic) ->
                assert.deepEqual dw.utils.smartRound(topic,1),[1568000, 2674000, 2681000, 3416000, 4721000, 6604000, 7254000, 8379000, 8432000, 8522000]

        'smartRound small numbers':
            'topic': [156e-6, 267e-6, 341e-6, 472e-6]
            'check values': (topic) ->
                assert.deepEqual dw.utils.smartRound(topic),[16e-5, 27e-5, 34e-5, 47e-5]

    .export module
