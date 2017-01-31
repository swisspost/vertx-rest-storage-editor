// ahared karma configuration file
module.exports = function () {
    return {

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'vendor/jquery.js',
            'vendor/jquery-ui.min.js',
            'vendor/jstree/jstree.min.js',
            'app/js/rest-editor.settings.js',
            'app/js/tree.js',
            'app/js/editor/editor.js',
            'node_modules/jquery-mockjax/dist/jquery.mockjax.js',
            'vendor/bootstrap.js',
            'vendor/bootstrap3-dialog/js/bootstrap-dialog.min.js'
        ],
        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        //singleRun: false
        singleRun: true,

        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            'app/**/*.js': ['coverage']
        },

        // optionally, configure the reporter
        coverageReporter: {
            type : 'html',
            dir : 'test/coverage/'
        }
    }
};
