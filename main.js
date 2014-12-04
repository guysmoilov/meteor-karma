var path = Npm.require('path')
var temp = Npm.require('temp').track()
var fs = Npm.require('fs')

log = loglevel.createPackageLogger('[sanjo:karma]', process.env.KARMA_LOG_LEVEL || 'info')

Karma = {
  start: function (id, options) {
    options = options || {}

    return KarmaInternals.startKarmaServer(id, options)
  }
}

KarmaInternals = {

  startKarmaServer: function (id, options) {
    var configPath = KarmaInternals.writeKarmaConfig(options)
    var karmaChild = practical.ChildProcessFactory.get()
    var spawnOptions = {
      taskName: id,
      command: KarmaInternals.getKarmaPath(),
      args: ['start', configPath]
    }
    karmaChild.spawnSingleton(spawnOptions)

    return karmaChild
  },

  writeKarmaConfig: function (options) {
    var config = 'module.exports = function(config) {\n' +
      '  config.set(' +
      JSON.stringify(options, null, 2) +
      ');\n};'
    var tempConfigFile = temp.openSync()
    fs.writeSync(tempConfigFile.fd, config)
    fs.closeSync(tempConfigFile.fd)

    return tempConfigFile.path
  },

  getKarmaPath: function () {
    // TODO: Use sanjo:assets-path-resolver when available
    return path.resolve(path.join(
      findAppDir(),
      '.meteor/local/build/programs/server/npm/sanjo:karma/node_modules/karma/bin/karma'
    ))
  }
}
