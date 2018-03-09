module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        subgrunt: {
            options: { },
            dwjs: { 'dw.js': 'default' }
        },
        // bowercopy: {
        //     options: {
        //         clean: true,
        //         destPrefix: 'www/static/vendor/',
        //         analytics: false,
        //         production: true,
        //     },
        //     libs: {
        //         files: {
        //             'bootstrap/css': 'bootstrap/docs/assets/css',
        //             'bootstrap/img': 'bootstrap/docs/assets/img/glyphicons*',
        //             'bootstrap/js': 'bootstrap/docs/assets/js/bootstrap.min.js',
        //             canvg: 'canvg/dist/*',
        //             'chroma-js': 'chroma-js/chroma*.js',
        //             'codemirror/addon': 'codemirror/addon',
        //             'codemirror/lib': 'codemirror/lib',
        //             'codemirror/mode/javascript': 'codemirror/mode/javascript',
        //             'font-awesome/css': 'font-awesome/css',
        //             'font-awesome/fonts': 'font-awesome/fonts',
        //             handsontable: 'handsontable/dist/*',
        //             imagesloaded: 'imagesloaded/imagesloaded*.js',
        //             jquery: 'jquery/dist/*',
        //             'json-js': 'JSON-js/json2.js',
        //             masonry: 'masonry/dist/masonry*.js',
        //             'queue-async': 'queue-async/queue*js',
        //             requirejs: 'requirejs/require*.js',
        //             underscore: 'underscore/underscore*',
        //             scrolltofixed: 'ScrollToFixed/jquery-scrolltofixed-min.js'
        //         }
        //     }
        // }
    });

    grunt.loadNpmTasks('grunt-subgrunt');
    // grunt.loadNpmTasks('grunt-bowercopy');

    // grunt.registerTask('default', ['subgrunt', 'bowercopy']);
    grunt.registerTask('default', ['subgrunt']);
};
