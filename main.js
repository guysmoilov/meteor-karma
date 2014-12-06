var path = Npm.require('path')
var fs = Npm.require('fs-extra')

log = loglevel.createPackageLogger('[sanjo:karma]', process.env.KARMA_LOG_LEVEL || 'info')

Karma = {
  start: function (id, options) {
    options = options || {}

    return KarmaInternals.startKarmaServer(id, options)
  }
}

KarmaInternals = {
  startKarmaServer: function (id, options) {
    var configPath = KarmaInternals.writeKarmaConfig(id, options)
    var karmaChild = practical.ChildProcessFactory.get()
    var spawnOptions = {
      taskName: id,
      command: KarmaInternals.getKarmaPath(),
      args: ['start', configPath]
    }
    karmaChild.spawnSingleton(spawnOptions)

    return karmaChild
  },

  writeKarmaConfig: function (id, options) {
    var configPath = KarmaInternals.getConfigPath(id)
    var config = 'module.exports = function(config) {\n' +
      '  config.set(' +
      JSON.stringify(options, null, 2) +
      ');\n};'
    fs.outputFileSync(configPath, config)

    return configPath
  },

  getConfigPath: function (id) {
    return path.join(
      KarmaInternals.getAppPath(),
      '.meteor/local/karma/' + id + '.config.js'
    )
  },

  getAppPath: function () {
    return path.resolve(findAppDir())
  },

  getKarmaPath: function () {
    // TODO: Use sanjo:assets-path-resolver when available
    return path.join(
      KarmaInternals.getAppPath(),
      '.meteor/local/build/programs/server/npm/sanjo:karma/node_modules/karma/bin/karma'
    )
  }
}
