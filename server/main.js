// TODO: Karma.registerPlugin
// Load plugins via plugins option by inlining them
// http://karma-runner.github.io/0.12/config/plugins.html

var server = Npm.require('karma').server
var runner = Npm.require('karma').runner

Karma = {
  server: {
    start: function (options, callback) {
      options = options || {}
      options = _.defaults(options, getFileConfig(), getDefaultConfig())
      return server.start(options, function (exitCode) {
        console.log('Karma start has exited with ' + exitCode);
        if (_.isFunction(callback)) {
          callback.apply(this, arguments)
        }
      });
    }
  },
  runner: {
    run: function (options, callback) {
      options = options || {}
      options = _.defaults(options, getFileConfig(), getDefaultConfig())
      return runner.run(options, function(exitCode) {
        console.log('Karma run has exited with ' + exitCode);
        if (_.isFunction(callback)) {
          callback.apply(this, arguments)
        }
      });
    }
  }
};

function getFileConfig() {
  try {
    var configPath = process.env.PWD + '/karma.json'
    var configContent = fs.readFileSync(configPath, {encoding: 'utf8'})
    return JSON.parse(configContent)
  } catch (error) {
    return {}
  }
}

function getDefaultConfig() {
  return {
    browsers: ["Chrome"],
    basePath: process.env.PWD
  }
}
