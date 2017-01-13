// karma configuration for local unit tests
var sharedConfig = require('./karma.shared.conf.js');

module.exports = function (config) {
    // load shared config
    var conf = sharedConfig();

    conf.files = conf.files.concat([
        // include unit testing files
        {pattern: 'test/spec/*.spec.js'}
    ]);

    config.set(conf);
};