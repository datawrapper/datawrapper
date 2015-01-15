module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('../package.json'),
        concat: {
            options: {
                stripBanners: true,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */',
            },
            dist: {
                src: ['src/dw.start.js', 'src/dw.dataset.js', 'src/dw.column.js', 'src/dw.column.types.js',
                    'src/dw.datasource.js', 'src/dw.datasource.delimited.js', 'src/dw.utils.js',
                    'src/dw.utils.filter.js', 'src/dw.chart.js', 'src/dw.visualization.js',
                    'src/dw.visualization.base.js', 'src/dw.theme.js', 'src/dw.theme.base.js', 'src/dw.end.js'],
                dest: 'dw-2.0.js'
            }
        },
        copy: {
            main: {
                files: [
                  // includes files within path
                  { src: ['dw-2.0.js'], dest: '../www/static/js/', filter: 'isFile'},
                ],
              }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: '../www/static/js/dw-2.0.js',
                dest: '../www/static/js/dw-2.0.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['concat', 'copy', 'uglify']);
};