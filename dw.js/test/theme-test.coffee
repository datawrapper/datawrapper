
_ = require 'underscore'
vows = require 'vows'
assert = require 'assert'

dw = require '../dw-2.0.js'


vows
    .describe('Some basic tests for dw.theme')
    .addBatch

        'create a theme':
            'topic': null
            'create a theme': () ->
                dw.theme.register 'A',
                    colors:
                        palette: ['red','green','yellow','purple']
                    padding: 10
                    margin:
                        top: 5
                        left: 5
                        bottom: 5
                        right: 5

            'check colors in A': () ->
                assert.deepEqual dw.theme('A').colors.palette, ['red','green','yellow','purple']

            'create a second theme that extends A': () ->
                dw.theme.register 'B', 'A',
                    colors:
                        palette: ['white','blue']
                    margin:
                        top: 10

            'check that B inherits from A': () ->
                assert.equal dw.theme('B').padding, 10

            'check that B has set new margin.top': () ->
                assert.equal dw.theme('B').margin.top, 10

            'check that B has still A\'s other margins': () ->
                assert.equal dw.theme('B').margin.left, 5
                assert.equal dw.theme('B').margin.bottom, 5

            'check colors in B': () ->
                assert.deepEqual dw.theme('B').colors.palette, ['white','blue']

    .export module
