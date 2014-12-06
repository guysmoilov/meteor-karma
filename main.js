var path = Npm.require('path')
var fs = Npm.require('fs-extra')

log = loglevel.createPackageLogger('[sanjo:karma]', process.env.KARMA_LOG_LEVEL || 'info')

Karma = {
  start: function (id, options) {
    options = options || {}

    var config = KarmaInternals.generateKarmaConfig(options)
    KarmaInternals.writeKarmaConfig(id, config)

    return KarmaInternals.startKarmaServer(id, options)
  },

  setConfig: function (id, options) {
    var oldConfig = KarmaInternals.readKarmaConfig(id)
    var newConfig = KarmaInternals.generateKarmaConfig(options)

    if (!oldConfig || newConfig !== oldConfig) {
      KarmaInternals.writeKarmaConfig(id, newConfig)

      // Restart running Karma server when config has changed
      var existingKarmaChild = KarmaInternals.getKarmaChild(id)
      if (existingKarmaChild) {
        existingKarmaChild.kill()
        KarmaInternals.startKarmaServer(id)
      }
    }
  }
}

KarmaInternals = {
  karmaChilds: {},

  getKarmaChild: function (id) {
    return KarmaInternals.karmaChilds[id]
  },

  setKarmaChild: function (id, karmaChild) {
    KarmaInternals.karmaChilds[id] = karmaChild
  },

  startKarmaServer: function (id) {
    var karmaChild = KarmaInternals.getKarmaChild(id)
    if (!karmaChild || !karmaChild.isRunning()) {
      karmaChild = KarmaInternals.createKarmaServer(id)
      KarmaInternals.setKarmaChild(id, karmaChild)
    }

    return karmaChild
  },

  createKarmaServer: function (id) {
    var karmaChild = new LongRunningChildProcess(id)
    var configPath = KarmaInternals.getConfigPath(id)
    var spawnOptions = {
      command: KarmaInternals.getKarmaPath(),
      args: ['start', configPath]
    }
    karmaChild.spawn(spawnOptions)
  },

  writeKarmaConfig: function (id, config) {
    var configPath = KarmaInternals.getConfigPath(id)
    fs.outputFileSync(configPath, config)

    return configPath
  },

  generateKarmaConfig: function (options) {
    return 'module.exports = function(config) {\n' +
      '  config.set(' +
      JSON.stringify(options, null, 2) +
      ');\n};'
  },

  readKarmaConfig: function (id) {
    var configPath = KarmaInternals.getConfigPath(id)
    try {
      return fs.readFileSync(configPath)
    } catch (error) {
      return null;
    }
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
