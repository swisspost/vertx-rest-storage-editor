module.exports = function(grunt) {
    var path = require('path');

    // grunt configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // clean up build folders
        clean: {
            options: { force: true },
            build: ['vendor/**', '<%= pkg.name %>-*.zip']
        },
        copy: {
            vendor: {
                files: [
                    {expand: true, cwd: 'node_modules/jquery/dist', src: ['jquery.js'], dest: 'vendor'},
                    {expand: true, cwd: 'node_modules/jquery-toast-plugin/dist', src: ['jquery.toast.min.css', 'jquery.toast.min.js'], dest: 'vendor'},
                    {expand: true, cwd: 'node_modules/jquery-ui-dist', src: ['jquery-ui.*', 'images/*'], dest: 'vendor'},
                    {expand: true, cwd: 'node_modules/jquery.cookie', src: ['jquery.cookie.js'], dest: 'vendor'},
                    {expand: true, cwd: 'node_modules/validate-js', src: ['validate.js'], dest: 'vendor'},
                    {expand: true, cwd: 'node_modules/ace-builds/src-min', src: ['ace.js', 'mode-html.js', 'mode-javascript.js',
                            'mode-json.js', 'mode-css.js', 'mode-markdown.js', 'ext-searchbox.js', 'worker-json.js'], dest: 'vendor/ace'},
                    {expand: true, cwd: 'node_modules/tv4', src: ['tv4.js'], dest: 'vendor'},
                    {expand: true, cwd: 'node_modules/bootstrap/dist/js', src: ['bootstrap.js'], dest: 'vendor'},
                    {expand: true, cwd: 'node_modules/bootstrap/dist', src: ['fonts/**', 'css/bootstrap.min.*'], dest: 'vendor/bootstrap'},
                    {expand: true, cwd: 'node_modules/bootstrap3-dialog/dist', src: ['**/*.min.*'], dest: 'vendor/bootstrap3-dialog'},
                    {expand: true, cwd: 'node_modules/jstree/dist', src: ['**/*.js'], dest: 'vendor/jstree'},
                    {expand: true, cwd: 'node_modules/font-awesome', src: ['css/*.min.css', 'css/*.map', 'fonts/**'], dest: 'vendor/font-awesome'},
                ]
            }
        },
        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                singleRun: true
            }
        },
        compress: {
            main: {
                options: {
                    archive: '<%= pkg.name %>-<%= pkg.version %>.zip'
                },
                files: [
                    {src: ['editor.html', 'index.html', 'package.json', 'README.md'], dest: ''},
                    {src: ['app/**'], dest: ''},
                    {src: ['vendor/**'], dest: ''}
                ]
            }
        }
    });

    // load plugins
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-karma');

    // default tasks
    grunt.registerTask('build', ['clean', 'copy']);
    grunt.registerTask('test', ['karma']);
    grunt.registerTask('package', ['compress']);
    grunt.registerTask('default', ['build', 'package']);
};
